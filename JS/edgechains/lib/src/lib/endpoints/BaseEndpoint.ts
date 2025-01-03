import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Jsonnet } from '@arakoodev/jsonnet';
import { Logger } from '../utils/Logger';

export abstract class BaseEndpoint {
    protected client: AxiosInstance;
    protected jsonnet: Jsonnet;
    protected logger: Logger;
    protected config: Record<string, any>;

    constructor(config: Record<string, any>) {
        this.config = config;
        this.client = axios.create({
            timeout: config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.jsonnet = new Jsonnet();
        this.logger = Logger.getInstance();
        
        // Setup interceptors
        this.setupInterceptors();
    }

    protected abstract setupInterceptors(): void;

    protected async executeRequest(config: AxiosRequestConfig) {
        try {
            const response = await this.client(config);
            return response.data;
        } catch (error) {
            this.logger.error('Request failed:', error);
            throw error;
        }
    }

    protected loadJsonnetConfig(configPath: string): Record<string, any> {
        return this.jsonnet.evaluateFile(configPath);
    }
}
