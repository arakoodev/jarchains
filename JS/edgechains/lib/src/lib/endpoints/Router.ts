import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

declare module 'axios' {
    interface AxiosRequestConfig {
        metadata?: {
            provider?: Provider;
            apiKey?: string;
        };
    }
}
import { Jsonnet } from '@arakoodev/jsonnet';
import { Logger } from '../utils/Logger.js';
import * as Sentry from '@sentry/node';
import posthog from 'posthog-node';

type EndpointConfig = {
    apiKey: string;
    baseUrl: string;
    rateLimit?: number;
    timeout?: number;
    currentTokens?: number;
    lastUsed?: number;
};

type Provider = 'openai' | 'palm' | 'cohere';

class Router {
    private endpoints: Map<Provider, EndpointConfig[]>;
    private client: AxiosInstance;
    private jsonnet: Jsonnet;
    private logger: Logger;
    private tokenUsage: Map<Provider, number>;
    private streamingClients: Map<string, AxiosInstance>;
    private activeRequests: Map<string, number>;
    constructor() {
        this.endpoints = new Map();
        this.client = axios.create();
        this.jsonnet = new Jsonnet();
        this.logger = Logger.getInstance();
        this.tokenUsage = new Map();
        this.streamingClients = new Map();
        this.activeRequests = new Map();

        // Initialize observability
        Sentry.init({ dsn: process.env.SENTRY_DSN });
        posthog.setup(process.env.POSTHOG_KEY, {
            api_host: process.env.POSTHOG_HOST
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Response interceptor for error handling and retries
        this.client.interceptors.response.use(
            (response) => {
                // Track token usage
                const provider = response.config.metadata?.provider;
                const apiKey = response.config.metadata?.apiKey;
                const tokens = response.data?.usage?.total_tokens;
                if (provider && this.isProvider(provider) && tokens && apiKey) {
                    this.updateTokenUsage(provider as Provider, tokens, apiKey);
                }
                return response;
            },
            async (error) => {
                const config = error.config;
                if (!config || !config.retryCount) {
                    config.retryCount = 0;
                }

                // Log error to Sentry
                Sentry.captureException(error);
                posthog.captureException('api_error', {
                    provider: config.metadata?.provider,
                    status: error.response?.status,
                    url: config.url
                });

                if (config.retryCount < 3) {
                    config.retryCount++;
                    await new Promise((resolve) => 
                        setTimeout(resolve, 1000 * config.retryCount)
                    );
                    return this.client(config);
                }

                this.logger.error('Request failed after retries:', error);
                return Promise.reject(error);
            }
        );
    }

    private updateTokenUsage(provider: Provider, tokens: number, apiKey: string) {
        const current = this.tokenUsage.get(provider) || 0;
        this.tokenUsage.set(provider, current + tokens);
        
        // Update endpoint usage
        const endpoints = this.endpoints.get(provider);
        if (endpoints) {
            const endpoint = endpoints.find(e => e.apiKey === apiKey);
            if (endpoint) {
                endpoint.currentTokens = (endpoint.currentTokens || 0) + tokens;
                endpoint.lastUsed = Date.now();
            }
        }
    }

    public addEndpoint(provider: Provider, config: EndpointConfig) {
        if (!this.endpoints.has(provider)) {
            this.endpoints.set(provider, []);
        }
        this.endpoints.get(provider)?.push({
            ...config,
            currentTokens: 0,
            lastUsed: Date.now()
        });
    }

    public addEndpointsFromJsonnet(configPath: string) {
        const config = this.jsonnet.evaluateFile(configPath);
        Object.entries(config).forEach(([provider, endpoints]) => {
            if (this.isProvider(provider)) {
                const typedEndpoints = endpoints as EndpointConfig[];
                const typedProvider = provider as Provider;
                typedEndpoints.forEach((endpoint) => {
                    this.addEndpoint(typedProvider, endpoint);
                });
            }
        });
    }

    private isProvider(value: string): value is Provider {
        return ['openai', 'palm', 'cohere'].includes(value);
    }

    private selectBestEndpoint(provider: Provider): EndpointConfig | null {
        const endpoints = this.endpoints.get(provider);
        if (!endpoints || endpoints.length === 0) return null;

        // Filter endpoints below rate limit and with least active requests
        const available = endpoints
            .filter(e => {
                const rateLimit = e.rateLimit || Infinity;
                return (e.currentTokens || 0) < rateLimit;
            })
            .sort((a, b) => {
                // Prefer endpoints with least tokens used
                const tokenDiff = (a.currentTokens || 0) - (b.currentTokens || 0);
                if (tokenDiff !== 0) return tokenDiff;
                
                // If tokens are equal, prefer endpoint with least active requests
                const aRequests = this.activeRequests.get(a.apiKey) || 0;
                const bRequests = this.activeRequests.get(b.apiKey) || 0;
                return aRequests - bRequests;
            });

        return available[0] || null;
    }

    public async executeRequest(
        provider: Provider,
        config: AxiosRequestConfig
    ): Promise<AxiosResponse> {
        const endpoint = this.selectBestEndpoint(provider);
        if (!endpoint) {
            throw new Error(`No available endpoints for ${provider}`);
        }

        // Track active requests
        const activeRequests = this.activeRequests.get(endpoint.apiKey) || 0;
        this.activeRequests.set(endpoint.apiKey, activeRequests + 1);

        const fullConfig: AxiosRequestConfig = {
            ...config,
            metadata: {
                provider,
                apiKey: endpoint.apiKey
            },
            onDownloadProgress: config.onDownloadProgress,
            responseType: config.responseType || 'json',
        };

        try {
            const response = await this.client(fullConfig);
            return response;
        } finally {
            // Decrement active requests count
            const currentRequests = this.activeRequests.get(endpoint.apiKey) || 0;
            this.activeRequests.set(endpoint.apiKey, Math.max(0, currentRequests - 1));
        }
    }

    public async executeStreamingRequest(
        provider: Provider,
        config: AxiosRequestConfig,
        onData: (data: string) => void,
        onError?: (error: Error) => void,
        onComplete?: () => void
    ): Promise<void> {
        const endpoint = this.selectBestEndpoint(provider);
        if (!endpoint) {
            throw new Error(`No available endpoints for ${provider}`);
        }

        // Track active requests
        const activeRequests = this.activeRequests.get(endpoint.apiKey) || 0;
        this.activeRequests.set(endpoint.apiKey, activeRequests + 1);

        const fullConfig: AxiosRequestConfig = {
            ...config,
            metadata: {
                provider,
                apiKey: endpoint.apiKey
            },
            responseType: 'stream',
            onDownloadProgress: (progressEvent) => {
                if (progressEvent.event.target.responseText) {
                    onData(progressEvent.event.target.responseText);
                }
            }
        };

        try {
            const response = await this.client(fullConfig);
            response.data.on('end', () => {
                if (onComplete) onComplete();
                // Decrement active requests count
                const currentRequests = this.activeRequests.get(endpoint.apiKey) || 0;
                this.activeRequests.set(endpoint.apiKey, Math.max(0, currentRequests - 1));
            });
            response.data.on('error', (error: Error) => {
                if (onError) onError(error);
                // Decrement active requests count
                const currentRequests = this.activeRequests.get(endpoint.apiKey) || 0;
                this.activeRequests.set(endpoint.apiKey, Math.max(0, currentRequests - 1));
            });
        } catch (error) {
            if (onError) onError(error as Error);
            // Decrement active requests count
            const currentRequests = this.activeRequests.get(endpoint.apiKey) || 0;
            this.activeRequests.set(endpoint.apiKey, Math.max(0, currentRequests - 1));
            throw error;
        }
    }
}
