// server.js
import { ArakooServer } from "@arakoodev/edgechains.js/arakooserver"
import { RetellAI } from "@arakoodev/edgechains.js/ai"
import { serveStatic } from '@hono/node-server/serve-static';

const retellai = new RetellAI("key_d16a952dff0d785b6a1b12a67570")
const server = new ArakooServer();
const app = server.createApp();
// type: "custom",
// name: "get_weather",
// description:
//     "Get the current weather, called when user is asking whether of a specific city.",
// parameters: {
//     type: "object",
//     properties: {
//         city: {
//             type: "string",
//             description: "The city for which the weather is to be fetched.",
//         },
//     },
//     required: ["city"],
// },
// speak_during_execution: true,
// speak_after_execution: true,
// url: "http://your-server-url-here/get_weawther",

await retellai.createLLM({})

const createAgentRes = await retellai.createAgent({});

app.get(
    '/static/*',
    serveStatic({
        root: './dist',
        rewriteRequestPath: (path) =>
            path.replace(/^\/static/, '/'),
    }))


app.get("/", (c) => {
    return c.html(`<html>
        <head>
            <title>HTMX Demo</title>
            <script src="/static/bundle.js" defer></script>
            <script src="https://unpkg.com/hyperscript.org@0.9.12"></script>
        </head>
        <body>
             <div class="controls">
                <button _="on click js 
                fetch('http://localhost:3000/call').then(async(res)=>{
                    console.log(res)
                    const {token} = await res.json();
                    startCall(token)
                    });
                 end">Start Call</button>
                <button _="on click call endCall()">End Call</button>
            </div>

            <div class="status">
                <p>Call Status: <span id="callStatus">Not started</span></p>
                <p>Error: <span id="error"></span></p>
            </div>
        </body>
    </html>`);
})


app.get("/call", async (c) => {
    const token = await retellai.initiateWebCall(createAgentRes.agent_id)
    return c.json({ token })
})

server.listen(3000)