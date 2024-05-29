"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const path = require("path");
const { OpenAI } = require("@arakoodev/edgechains.js/openai");
const Jsonnet = require("@arakoodev/jsonnet");
const jsonnet = new Jsonnet();
const secretsPath = path.join(__dirname, "../../jsonnet/secrets.jsonnet");
const openAIApiKey = JSON.parse(jsonnet.evaluateFile(secretsPath)).openai_api_key;
const openai = new OpenAI({ apiKey: openAIApiKey });
const schema = zod_1.z.object({
    answer: zod_1.z.string().describe("The answer to the question")
});
function openAICall() {
    return function (prompt) {
        try {
            return openai.zodSchemaResponse({ prompt, schema: schema }).then((res) => {
                return JSON.stringify(res);
            });
        }
        catch (error) {
            return error;
        }
    };
}
module.exports = openAICall;
