import { TextSplitter } from "@arakoodev/splitter";
import { ArakooServer } from '@arakoodev/arakooserver';
import { PdfLoader } from "@arakoodev/document-loader"
import TokenBucket from "../../utils/tokenBucket.js";

const server = new ArakooServer();
const splitter = new TextSplitter();
const bucket = new TokenBucket(10, 1, 1);

export const UploadPdfRouter:any = server.createApp();


UploadPdfRouter.post("/", async (c) => {
    try {
        if (!bucket.handleRequest("uploadPdf")) {
            return c.json({ error: "Rate limit exceeded" });
        }
        const body = await c.req.parseBody()
        const text = body['file']
        console.log({text})
        // @ts-ignore
        const buffer = await text?.arrayBuffer();
        const loader = new PdfLoader(buffer);
        const docs = await loader.loadPdf()
        const chunks = await splitter.splitTextIntoChunks(docs, 1000);
        return c.json({ chunks })

    } catch (error) {
        console.log(error);
        return c.json({ error: "An error occurred while processing the file." });
    }
});
