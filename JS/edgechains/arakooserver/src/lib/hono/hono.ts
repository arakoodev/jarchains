import { serve } from "@hono/node-server";
import { Hono } from "hono";
export class ArakooServer {
    public app = new Hono();

    createApp() {
        return this.app;
    }

    listen(port?: number) {
        const portNumber = port || 3000;

        serve({
            fetch: this.app.fetch,
            port: portNumber
        }, () => {
            console.log(`Server running on port ${portNumber}`);
        });
    }
}
