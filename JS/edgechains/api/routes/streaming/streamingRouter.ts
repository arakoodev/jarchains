import { ArakooServer } from "@arakoodev/arakooserver";
import { Stream } from "@arakoodev/openai"
import { config } from "dotenv"

import TokenBucket from "../../utils/tokenBucket.js";

config()

const server = new ArakooServer();
const straming = new Stream({ OpenApiKey: process.env.OPENAI_API_KEY });
const bucket = new TokenBucket(4, 1, 1);

export const StreamingRouter: any = server.createApp();

StreamingRouter.get('/:question', async (c) => {
    if (!bucket.handleRequest("uploadToSupabase")) {
        return c.json({ statusCode: 429, message: "Rate limit exceeded" })
    }
    const question = c.req.param('question')
    try {
        return server.Stream(c, async (stream) => {
            const reader = await straming.OpenAIStream(question)

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }
                await stream.write(value)
            }
        })

    } catch (error) {
        console.error(error);
        c.json({ status: 500, error })
    }

})