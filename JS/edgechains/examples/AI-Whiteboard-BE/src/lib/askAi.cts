const { GoogleGenerativeAI } = require("@google/generative-ai");


async function askAI({ prompt, geminiKey }: any) {
    try {
        const gemini = new GoogleGenerativeAI(geminiKey);
        const model = gemini.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            systemInstruction: "You are a helpful assistant that respond with the as short as answer to the question if the answer is within one-two words or numbers (if mathematical expresions or equations asked)\n                        Note : when asked to create/generate a checklist of topic use this syntax with markdown syntax : \n                        - [ ] Unchecked item\n                        Note: when asked to write/generate code then write a enclosed your answer withing ``` & ```\n                        Remember to respond only in the json format : \n                        {result:\"<You short answer inn the markdown format>\"}",
          });
          const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          };
          const chatSession = model.startChat({
            generationConfig,
            history: [
            ],
          });
        
          const result = await chatSession.sendMessage(prompt);
          const response = JSON.parse(result.response.text());
          // console.log(response);
          
          return response;
    } catch (error) {
        return error;
    }
}

module.exports = askAI;

