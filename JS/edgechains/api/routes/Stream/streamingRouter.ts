import { ArakooServer } from "@arakoodev/arakooserver";
import { Stream } from "@arakoodev/openai"
import { config } from "dotenv"
config()

const server = new ArakooServer();
const straming = new Stream({ OpenApiKey: process.env.OPENAI_API_KEY });
const decoder = new TextDecoder()

export const StreamingRouter: any = server.createApp();

StreamingRouter.get('/:question', async (c) => {
    const question = c.req.param('question')
    try {
        return server.Stream(c, async (stream) => {
            const reader = await straming.OpenAIStream(question)

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }
                const chunkValue = decoder.decode(value);
                const val = JSON.parse(chunkValue.replace(/^data:/, "")).text ?? ""
                var uint8array = new TextEncoder().encode(val);

                await stream.write(uint8array)
            }
        })

    } catch (error) {
        console.error(error);
        c.json({ status: 500, error })
    }

})
