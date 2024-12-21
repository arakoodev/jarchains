import { ArakooServer } from "@arakoodev/edgechains.js/arakooserver";
import Jsonnet from "@arakoodev/jsonnet";
import {createSyncRPC} from "@arakoodev/edgechains.js/sync-rpc";


import fileURLToPath from "file-uri-to-path";
import path from "path";
const server = new ArakooServer();

const app = server.createApp();

const jsonnet = new Jsonnet();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mermaidCall = createSyncRPC(path.join(__dirname, "./lib/mermaid.cjs"));
const askAI = createSyncRPC(path.join(__dirname, "./lib/askAi.cjs"));
const vision = createSyncRPC(path.join(__dirname, "./lib/vision.cjs"));

app.get("/generate-diagram", async (c: any) => {
  
    const prompt = c.req.query("prompt");
    const gemini_api = JSON.parse(
        jsonnet.evaluateFile(path.join(__dirname, "../jsonnet/secrets.jsonnet"))
    ).gemini_api;
    jsonnet.extString("prompt", prompt || "");
    jsonnet.extString("gemini_api", gemini_api);
    jsonnet.javascriptCallback("mermaidCall", mermaidCall);
    const response = JSON.parse(jsonnet.evaluateFile(path.join(__dirname, "../jsonnet/main.jsonnet")))
    
    console.log(JSON.parse(response));
    
    
    return c.json({mermaid_syntax:JSON.parse(response).mermaid_syntax});
});
app.get("/ask-ai", async (c: any) => {
    
    const prompt = c.req.query("question");
    const gemini_api = JSON.parse(
        jsonnet.evaluateFile(path.join(__dirname, "../jsonnet/secrets.jsonnet"))
    ).gemini_api;
    jsonnet.extString("prompt", prompt || "");
    jsonnet.extString("gemini_api", gemini_api);
    jsonnet.javascriptCallback("askAI", askAI);
    const response = JSON.parse(jsonnet.evaluateFile(path.join(__dirname, "../jsonnet/askAi.jsonnet")))
    
    console.log(JSON.parse(response));
    
    
    return c.json({result:JSON.parse(response).result});
});
app.post("/calculate", async (c: any) => {
    
    const {image} = await c.req.json();
    
    const gemini_api = JSON.parse(
        jsonnet.evaluateFile(path.join(__dirname, "../jsonnet/secrets.jsonnet"))
    ).gemini_api;
    
    jsonnet.extString("image", image || "");
    jsonnet.extString("gemini_api", gemini_api);
    jsonnet.javascriptCallback("vision", vision);
    const response = JSON.parse(jsonnet.evaluateFile(path.join(__dirname, "../jsonnet/vision.jsonnet")))
    console.log(response.result);
    
    console.log(JSON.parse(response));
    
    
    return c.json({
        expr:JSON.parse(response).expr,
        result:JSON.parse(response).result,
    });
});

app.get("/",async(c:any)=>{
    return c.json({"hello":"hello"});
})

server.listen(3000);