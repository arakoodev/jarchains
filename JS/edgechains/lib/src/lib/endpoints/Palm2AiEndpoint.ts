
export async function Palm2ChatFn(prompt: string, apiKey: string, temperature: number = 0.1): Promise<string> {
    const LANGUAGE_MODEL_URL = `https://generativelanguage.googleapis.com/v1beta1/models/chat-bison-001:generateMessage?key=${apiKey}`;

    const payload = {
        prompt: { "messages": [{ "content": prompt }] },
        temperature,
        candidate_count: 1,
    };

    const response = await fetch(LANGUAGE_MODEL_URL, {
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        method: "POST",
    });

    const data = await response.json();
    return data.candidates[0].content;
}