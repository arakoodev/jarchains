local content = std.extVar("prompt");
local gemini_api = std.extVar('gemini_api');

local main(prompt) =
    local response = arakoo.native("askAI")({ prompt: prompt, geminiKey: gemini_api });
    response;

main(content)