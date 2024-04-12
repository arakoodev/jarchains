export type ChatGPTAgent = "user" | "system";
export interface ChatGPTMessage {
    role: ChatGPTAgent;
    content: string;
}
export interface OpenAIStreamPayload {
    model?: string;
    OpenApiKey?: string;
    message?: [ChatGPTMessage];
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    max_tokens?: number;
    stream?: boolean;
    n?: number;
}
export declare class Stream {
    model?: string;
    OpenApiKey?: string;
    message?: [ChatGPTMessage];
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    max_tokens?: number;
    stream?: boolean;
    n?: number;
    constructor(options?: OpenAIStreamPayload);
    encoder: TextEncoder;
    decoder: TextDecoder;
    OpenAIStream(prompt: string): Promise<any>;
}
