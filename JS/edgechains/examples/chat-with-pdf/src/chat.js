import { ChatOpenAi } from "../../../lib/index.js";
import { Supabase } from "../../../lib/index.js";
import { PdfLoader } from "../../../lib/index.js";
import { TextSplitter } from "../../../lib/index.js";
import { fileURLToPath } from "url";
import { Hono } from "hono";
import path from "path";
const __dirname = fileURLToPath(import.meta.url);
const loader = new PdfLoader(path.join(__dirname, "../../example.pdf"));
const docs = await loader.loadPdf();
const splitter = new TextSplitter(500);
const splitedDocs = splitter.splitTextIntoChunks(docs);
export const ChatRouter = new Hono();
const getJsonnet = async () => {
    let jsonnet = await import("@arakoodev/jsonnet");
    return jsonnet.default;
};
const promptPath = path.join(__dirname, "../../jsonnet/prompt.jsonnet");
const InterPath = path.join(__dirname, "../../jsonnet/intermediate.jsonnet");
const secretsPath = path.join(__dirname, "../../jsonnet/secrets.jsonnet");
const Jsonnet = await getJsonnet();
const jsonnet = new Jsonnet();
const secretsLoader = await jsonnet.evaluateFile(secretsPath);
const openAIApiKey = await JSON.parse(secretsLoader).openai_api_key;
const supabaseApiKey = await JSON.parse(secretsLoader).supabase_api_key;
const supabaseUrl = await JSON.parse(secretsLoader).supabase_url;
// console.log(supabaseUrl, supabaseApiKey, openAIApiKey)
const supabase = new Supabase(supabaseUrl, supabaseApiKey);
const client = supabase.createClient();
const llm = new ChatOpenAi({
    openAIApiKey: openAIApiKey
});
async function getEmbeddings(content) {
    const embeddings = await llm.generateEmbeddings(content);
    return embeddings;
}
async function InsertToSupabase(content) {
    const embeddingsArr = await getEmbeddings(content);
    for (let i = 0; i < embeddingsArr.length; i++) {
        if (content[i].length <= 1) {
            continue;
        }
        const element = embeddingsArr[i].embedding;
        const data = await supabase.insertVectorData({
            client,
            tableName: "documents",
            content: content[i],
            embedding: element
        });
        // console.log(data)
    }
}
ChatRouter.get("/chatWithpdf", async (c) => {
    // await InsertToSupabase(splitedDocs)
    const searchStr = c.req.query("question");
    const promptLoader = await jsonnet.evaluateFile(promptPath);
    const promptTemplate = await JSON.parse(promptLoader).custom_template;
    const embeddingsArr = await getEmbeddings(searchStr);
    const { data } = await supabase.getDataFromQuery({
        client,
        functionNameToCall: "match_documents",
        query_embedding: embeddingsArr[0].embedding,
        similarity_threshold: 0.5,
        match_count: 3
    });
    const contentArr = [];
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        contentArr.push(element.content);
    }
    const content = contentArr.join(" ");
    let InterLoader = await jsonnet
        .extString("promptTemplate", promptTemplate)
        .extString("query", searchStr || "")
        .extString("content", content)
        .evaluateFile(InterPath);
    const prompt = JSON.parse(InterLoader).prompt;
    const res = await llm.generateResponse(prompt);
    console.log(res);
    return c.json({ res });
});
