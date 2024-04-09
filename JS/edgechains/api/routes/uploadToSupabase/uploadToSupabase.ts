import { ArakooServer } from "../../../arakooserver/index.js";
import { Supabase } from "../../../supabase/index.js";
import { config } from "dotenv"
import TokenBucket from "../../utils/tokenBucket.js";
config()

const server = new ArakooServer();
const bucket = new TokenBucket(4, 1, 1);
const supabase = new Supabase(process.env.SUPABASE_URL!, process.env.SUPABASE_API_KEY!)

const client = supabase.createClient()

export const uploadToSupabaseRouter = server.createApp();

interface BodyType {
    embeddings: Array<{ embedding: Array<number> }>,
    content: Array<string>,
    tableName: string
}

uploadToSupabaseRouter.post("/", async (c) => {
    try {
        if (!bucket.handleRequest("uploadToSupabase")) {
            return c.json({ statusCode: 429, message: "Rate limit exceeded" })
        }
        const body = await JSON.parse(await c.req.text());
        const { embeddings, content, tableName } = body as BodyType

        if (!embeddings) {
            return c.json({ statusCode: 400, message: "embeddings is required" })
        }
        if (!content) {
            return c.json({ statusCode: 400, message: "content is required" })
        }
        if (!tableName) {
            return c.json({ statusCode: 400, message: "tableName is required" })
        }

        for (let i = 0; i < embeddings.length; i++) {
            if (content[i].length <= 1) {
                continue;
            }

            const element = embeddings[i].embedding;

            const res = await supabase.insertVectorData({
                client,
                tableName,
                content: content[i],
                embedding: element
            })
            console.log(res)
        }

        return c.json({ statusCode: 200, message: `successfully uploaded to ${tableName}` })

    } catch (error) {
        console.error("Error uploading to supabase:", error);
        return c.json({ statusCode: 500, message: "Error uploading to supabase" })
    }

})