import { Stream, OpenAIStreamPayload } from '../../lib/streaming/OpenAiStreaming.js';
// Mock fetch function
jest.mock('node-fetch');

describe('Stream', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock function calls after each test
  });

  test('OpenAIStream should fetch data and create a readable stream', async () => {
    // Mock fetch response
    const mockResponse = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('[{"choices":[{"delta":{"content":"Response 1"}}]}]'));
        controller.enqueue(new TextEncoder().encode('[{"choices":[{"delta":{"content":"Response 2"}}]}]'));
        controller.enqueue(new TextEncoder().encode('[DONE]'));
        controller.close();
      }
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      body: mockResponse,
    });

    // Mock OpenAIStreamPayload options
    const options: OpenAIStreamPayload = {
      model: 'test_model',
      OpenApiKey: 'test_api_key',
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 500,
      stream: true,
      n: 1,
    };

    // Create a new Stream instance
    const stream = new Stream(options);

    // Call OpenAIStream method
    const result = await stream.OpenAIStream('test prompt');

    // Check if fetch is called with the correct parameters
    expect(fetch).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.OpenApiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages: [{ role: 'user', content: 'test prompt' }],
        stream: options.stream,
        temperature: options.temperature,
        top_p: options.top_p,
        n: options.n,
        presence_penalty: options.presence_penalty,
        frequency_penalty: options.frequency_penalty,
        max_tokens: options.max_tokens,
      }),
    });

    // Check if OpenAIStream method returns a readable stream
    expect(result).toBeInstanceOf(ReadableStream);

    // Read data from the readable stream and test its content
    const reader = result.getReader();
    let data = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      data += new TextDecoder().decode(value);
    }

    // Check if the stream data is parsed correctly
    expect(data).toEqual(`data: {"text":"Response 1"}\n\ndata: {"text":"Response 2"}\n\n`);
  });
});
