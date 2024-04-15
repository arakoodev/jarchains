import chalk from 'chalk';
export default class TokenBucket {
    capacity;
    refillTime;
    refillAmount;
    db;
    constructor(capacity, refillAmount, refillTime) {
        this.capacity = capacity;
        this.refillTime = refillTime; // amount of time between refills (in sec)
        this.refillAmount = refillAmount; // number of tokens to add per refill cycle
        this.db = {};
    }
    refillBucket(key) {
        if (this.db[key] === undefined)
            return null;
        const { tokens, ts } = this.db[key];
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - ts) / (this.refillTime * 1000) // convert to seconds
        );
        const newTokens = elapsedTime * this.refillAmount;
        this.db[key] = {
            tokens: Math.min(this.capacity, tokens + newTokens),
            ts: currentTime,
        };
        return this.db[key];
    }
    createBucket(key) {
        if (this.db[key] === undefined) {
            this.db[key] = {
                tokens: this.capacity,
                ts: Date.now(),
            };
        }
        return this.db[key];
    }
    handleRequest(key) {
        let bucket = this.createBucket(key);
        const currentTime = Date.now();
        // check if the time elapsed since the (convert to seconds)
        const elapsedTime = Math.floor((currentTime - bucket.ts) / 1000);
        if (elapsedTime >= this.refillTime) {
            //@ts-ignore
            bucket = this.refillBucket(key);
        }
        else {
            if (bucket?.tokens <= 0) {
                console.log(chalk.red(`Request[REJECTED] for ${key} (tokens - ${bucket.tokens}) -- ${new Date().toLocaleTimeString()}\n`));
                return false;
            }
        }
        if (!bucket) {
            chalk.red(`Request[REJECTED] for ${key} -- ${new Date().toLocaleTimeString()} -- BUCKET NOT FOUND\n`);
            return false;
        }
        console.log(chalk.green(`Request[ACCEPTED] for ${key} (tokens - ${bucket.tokens}) -- ${new Date().toLocaleTimeString()}\n`));
        bucket.tokens -= 1;
        return true;
    }
}
