const { GoogleGenerativeAI } = require("@google/generative-ai");


async function mermaidCall({ prompt, geminiKey }: any) {
    try {
        const gemini = new GoogleGenerativeAI(geminiKey);
        const model = gemini.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            systemInstruction: "You are a helpful ai assidtant that based on user inpput response with a mermaid syntax for the user input in jason format : {\"mermaid_syntax\": \"Mermaid code here\"}",
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

module.exports = mermaidCall;

