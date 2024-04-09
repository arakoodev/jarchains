import { TextSplitter } from "../../../splitter/index.js";
import { ArakooServer } from '../../../arakooserver/index.js';
import { PdfLoader } from "../../../document-loader/index.js"
import TokenBucket from "../../utils/tokenBucket.js";

const server = new ArakooServer();
const splitter = new TextSplitter();
const loader = new PdfLoader();
const bucket = new TokenBucket(10, 1, 1);

export const UploadPdfRouter = server.createApp();


UploadPdfRouter.post("/", async (c) => {
    try {
        if (!bucket.handleRequest("uploadPdf")) {
            return c.json({ error: "Rate limit exceeded" });
        }
        const body = await c.req.parseBody()
        const text = body['file']

        // @ts-ignore
        const buffer = await text?.arrayBuffer();
        const docs = await loader.loadPdf(buffer)
        const chunks = await splitter.splitTextIntoChunks(docs, 1000);
        return c.json({ chunks })

    } catch (error) {
        console.log(error);
        return c.json({ error: "An error occurred while processing the file." });
    }
});
