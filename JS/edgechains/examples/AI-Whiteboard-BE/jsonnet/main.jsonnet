local promptTemplate = |||
                        You are a helpful AI assistant that generates diagrams in Mermaid syntax.Always respond in the following JSON format:
                        {"mermaid_syntax": "Mermaid code here"}
                        no need for any escape character in json formar output
                        Do not include any additional explanations or outputs.
                        user input : {content}
                       |||;

local content = std.extVar("prompt");
local gemini_api = std.extVar('gemini_api');

local getFullPrompt(content) = 
    local promptWithContent = std.strReplace(promptTemplate, '{content}', content);
    promptWithContent;

local main(prompt) =
    local response = arakoo.native("mermaidCall")({ prompt: prompt, geminiKey: gemini_api });
    response;


main(getFullPrompt(content))