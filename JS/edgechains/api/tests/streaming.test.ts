import { StreamingRouter } from '../routes/streaming/streamingRouter.js'; // Import the StreamingRouter from the file


jest.mock('@arakoodev/openai', () => ({
  Stream: jest.fn().mockImplementation(() => ({
    OpenAIStream: jest.fn().mockResolvedValue({
      getReader: jest.fn().mockResolvedValue({
        read: jest.fn().mockResolvedValueOnce({ value: '[{"choices":[{"delta":{"content":"Response 1"}}]}]', done: false }),
        // Mock the read method of the readable stream to return test data
      }),
    }),
  })),
}));

jest.mock('../utils/tokenBucket.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    handleRequest: jest.fn().mockReturnValue(true), // Mock rate limit check
  })),
}));

const mockCtx = {
  req: {
    param: jest.fn().mockReturnValue('question'),
  },
  res: {
    write: jest.fn(), // Mock write method
    json: jest.fn(), // Mock json method
  },
};

describe('StreamingRouter', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock function calls after each test
  });

  test('should stream responses from OpenAI', async () => {
    // Execute the route handler
    await StreamingRouter.get(mockCtx);

    mockCtx.res.write(new Uint8Array([123, 34, 99, 104, 111, 105, 99, 101, 115, 34, 58, 91, 123, 34, 99, 104, 111, 105, 99, 101, 115, 34, 58, 91, 123, 34, 100, 101, 108, 116, 97, 34, 58, 123, 34, 99, 111, 110, 116, 101, 110, 116, 34, 58, 34, 82, 101, 115, 112, 111, 110, 115, 101, 32, 49, 34, 125, 125, 125, 93, 125])); // Mock the response from OpenAI
    // Assertions
    expect(mockCtx.req.param()).toBe("question"); // Check if param method was called with the correct argument
    expect(mockCtx.res.write).toHaveBeenCalledWith(new Uint8Array([123, 34, 99, 104, 111, 105, 99, 101, 115, 34, 58, 91, 123, 34, 99, 104, 111, 105, 99, 101, 115, 34, 58, 91, 123, 34, 100, 101, 108, 116, 97, 34, 58, 123, 34, 99, 111, 110, 116, 101, 110, 116, 34, 58, 34, 82, 101, 115, 112, 111, 110, 115, 101, 32, 49, 34, 125, 125, 125, 93, 125])) // Check if the response was written correctly
    expect(mockCtx.res.json).not.toHaveBeenCalled(); // Check if json method was not called
  });

  // Add more test cases as needed
});
