{
    model: std.extVar("model"),
    messages:[
        {
            role:"system",
            content:std.extVar("prompt")
        },
        {
            role:"user",
            content:std.extVar("query")
        }
    ]
}