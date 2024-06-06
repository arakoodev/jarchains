import { ArakooServer } from "@arakoodev/edgechains.js/arakooserver";
import Jsonnet from "@arakoodev/jsonnet";
//@ts-ignore
import createClient from "sync-rpc";
import fileURLToPath from "file-uri-to-path";
import path from "path";
import { PdfLoader } from "@arakoodev/edgechains.js/document-loader";
const server = new ArakooServer();
const app = server.createApp();
server.useCors("*");
const jsonnet = new Jsonnet();
const __dirname = fileURLToPath(import.meta.url);
const openAICall = createClient(path.join(__dirname, "../lib/generateResponse.cjs"));
app.post("/upload-resume", async (c) => {
    console.time("time");
    const { file } = await c.req.parseBody();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const loader = new PdfLoader(buffer);
    const docs = await loader.loadPdf();
    jsonnet.extString("resume", JSON.stringify(docs));
    jsonnet.javascriptCallback("openAICall", openAICall);
    let response = jsonnet.evaluateFile(path.join(__dirname, "../../jsonnet/main.jsonnet"));
    return c.json(JSON.parse(response));
});
server.listen(3000);
