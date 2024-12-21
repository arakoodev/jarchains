**Introduction**  
Welcome to this walkthrough of our project where we’ve built APIs using EdgeChain with a Hono.js server. These APIs power a frontend by enabling interactions like diagram generation, AI question-answering, and image-based calculations. Let’s dive into how we’ve structured and implemented these functionalities.

---

**Video Explanation(click below**:
[![Watch the video](https://raw.githubusercontent.com/sujal011/edgechains-sample/main/AI-Whiteboard-BE/thumbnail.png)](https://youtu.be/TqReTsLuHN0)

**Step 1: Creating a Server with EdgeChain**  
We start by creating a server using EdgeChain, a lightweight and efficient framework that leverages Hono.js for routing.  

```javascript
import { ArakooServer } from "@arakoodev/edgechains.js/arakooserver";
const server = new ArakooServer();
const app = server.createApp();
```

Here, `ArakooServer` initializes the server, and `createApp()` helps define application-level routes.

---

**Step 2: Dependencies and Utilities**  
We import several utilities to enhance functionality:  
- **Jsonnet** for template-based computations.  
- **SyncRPC** for converting asynchronous tasks into synchronous ones.  
- **Path utilities** to handle file operations.

```javascript
import Jsonnet from "@arakoodev/jsonnet";
import { createSyncRPC } from "@arakoodev/edgechains.js/sync-rpc";
import path from "path";
const jsonnet = new Jsonnet();
```

These tools allow us to evaluate JSON-like templates and communicate with external scripts efficiently.

---

**Step 3: Understanding the `/generate-diagram` API**  
Let’s focus on the `app.get("/generate-diagram")` route, which generates diagrams in Mermaid syntax.  

**Step 3.1: Retrieving Inputs**  
First, we retrieve the `prompt` from the request query.  
```javascript
const prompt = c.req.query("prompt");
```

**Step 3.2: Loading API Credentials**  
Next, we load the API key securely from a Jsonnet file.  
```javascript
const gemini_api = JSON.parse(
    jsonnet.evaluateFile(path.join(__dirname, "../jsonnet/secrets.jsonnet"))
).gemini_api;
```

**Step 3.3: Extending Variables for Jsonnet**  
We pass the `prompt` and API key into Jsonnet using `extString`.  
```javascript
jsonnet.extString("prompt", prompt || "");
jsonnet.extString("gemini_api", gemini_api);
```

**Step 3.4: Using `mermaidCall`**  
A synchronous RPC call, `mermaidCall`, generates the Mermaid diagram syntax. This RPC is linked to a CommonJS module, which we'll explain later.  
```javascript
jsonnet.javascriptCallback("mermaidCall", mermaidCall);
```

**Step 3.5: Evaluating the Jsonnet File**  
The Jsonnet file processes the prompt and API key to produce the output.  
```javascript
const response = JSON.parse(
    jsonnet.evaluateFile(path.join(__dirname, "../jsonnet/main.jsonnet"))
);
```

Finally, the response is sent back in JSON format.  
```javascript
return c.json({ mermaid_syntax: JSON.parse(response).mermaid_syntax });
```

---

**Step 4: The Jsonnet Template**  
The Jsonnet file structures the logic for generating diagrams.  

- **Prompt Template**: Defines the behavior of the AI assistant and ensures responses follow a JSON format.  
```jsonnet
local promptTemplate = |||
    You are a helpful AI assistant that generates diagrams in Mermaid syntax...
|||;
```

- **Dynamic Variables**: The `content` variable is dynamically inserted into the prompt.  
```jsonnet
local content = std.extVar("prompt");
local gemini_api = std.extVar("gemini_api");
```

- **Processing the Prompt**: A function formats the full prompt.  
```jsonnet
local getFullPrompt(content) = 
    local promptWithContent = std.strReplace(promptTemplate, '{content}', content);
    promptWithContent;
```

- **Generating the Response**: The `mermaidCall` RPC processes the prompt and API key to generate the final diagram.  
```jsonnet
main(getFullPrompt(content));
```

---

**Step 5: Converting `mermaidCall` to Sync Using SyncRPC**  
Now, let’s discuss the implementation of `mermaidCall`. This function uses Google Generative AI to create Mermaid syntax.

**Step 5.1: Function Overview**  
The function initializes the Google Generative AI model using the provided API key and generates output based on the user’s prompt.  
```javascript
async function mermaidCall({ prompt, geminiKey }) {
    const gemini = new GoogleGenerativeAI(geminiKey);
    const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const chatSession = model.startChat({ generationConfig });
    const result = await chatSession.sendMessage(prompt);
    return JSON.parse(result.response.text());
}
```

**Step 5.2: Sync Conversion**  
With `SyncRPC`, this asynchronous process is transformed into a synchronous operation.  
```javascript
const mermaidCall = createSyncRPC(path.join(__dirname, "./lib/mermaid.cjs"));
```

This ensures seamless integration with Jsonnet’s JavaScript callback mechanism.

---

**Step 6: Additional APIs**  
Similarly, the `/ask-ai` and `/calculate` routes follow the same flow, interacting with Jsonnet and using SyncRPC for tasks like answering questions and performing image-based calculations.

---

**Conclusion**  
In this project, we combined EdgeChain’s Hono.js server, Jsonnet for template-based computations, and SyncRPC for efficient asynchronous handling. These APIs form the backbone of a frontend capable of dynamic diagram generation, AI question answering, and more.  

We hope this explanation helps you understand the flow and implementation of EdgeChain.

--- 

