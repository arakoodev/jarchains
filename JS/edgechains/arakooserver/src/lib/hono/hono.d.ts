import { Hono } from "hono";
export declare class ArakooServer {
    app: Hono<import("hono").Env, import("hono/types").BlankSchema, "/">;
    createApp(): Hono<import("hono").Env, import("hono/types").BlankSchema, "/">;
    listen(port?: number): void;
}
