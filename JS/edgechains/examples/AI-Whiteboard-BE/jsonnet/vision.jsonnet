local imageUri = std.extVar("image");
local gemini_api = std.extVar('gemini_api');

local main() =
    local response = arakoo.native("vision")({ imageUri: imageUri, geminiKey: gemini_api });
    response;

main()