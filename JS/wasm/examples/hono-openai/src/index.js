import { Hono } from "hono";
const app = new Hono();
// import { serve } from "@hono/node-server";
import Jsonnet from "@arakoodev/jsonnet";

let openAiEndpoint = "https://api.openai.com/v1/chat/completions";

app.get('/quote', async (c) => {
    try {
        let jsonnet = new Jsonnet();
        let query = c.req.query("query");
        let prompt = JSON.parse(jsonnet.evaluateFile("./prompts/quote.jsonnet")).prompt;
        let fetchBody = jsonnet.extString("prompt", prompt).extString("query", query).extString("model", "gpt-3.5-turbo").evaluateFile("./prompts/config.jsonnet");
        console.log(typeof fetchBody)
        let response = await fetch(openAiEndpoint, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "Authorization": "Bearer openai key here"
            },
            body: fetchBody
        });
        let body = await response.json();
        console.log(body.choices[0].message.content)
        return c.json(body.choices[0].message.content);
    } catch (error) {
        console.log("error occured");
        console.log(error);
    }
})

app.get('/hello', async (c) => {
    try {
        let jsonnet = new Jsonnet();
        const code = `
        local username = std.extVar('name');
        local Person(name='Alice') = {
          name: name,
          welcome: 'Hello ' + name + '!',
        };
        {
          person1: Person(username),
          person2: Person('Bob'),
        }`;
        let result = jsonnet.extString("name", "ll").evaluateSnippet(code);
        return c.json(JSON.parse(result));
    } catch (error) {
        console.log(error)
    }
})

app.fire();

// serve(app, (info) => {
//     console.log(`Server started on http://localhost:${info.port}`);
// });