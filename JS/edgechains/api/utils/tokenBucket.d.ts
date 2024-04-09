export default class TokenBucket {
    capacity: number;
    refillTime: number;
    refillAmount: number;
    db: {
        [key: string]: {
            tokens: number;
            ts: number;
        };
    };
    constructor(capacity: number, refillAmount: number, refillTime: number);
    refillBucket(key: any): {
        tokens: number;
        ts: number;
    } | null;
    createBucket(key: any): {
        tokens: number;
        ts: number;
    };
    handleRequest(key: any): boolean;
}
