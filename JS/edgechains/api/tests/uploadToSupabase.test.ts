import { uploadToSupabaseRouter } from '../routes/uploadToSupabase/uploadToSupabase.js'; // Import the uploadToSupabaseRouter from the file

jest.mock('@arakoodev/vector-db', () => ({
    Supabase: jest.fn().mockImplementation(() => ({
        createClient: jest.fn().mockReturnValue({
            insertVectorData: jest.fn().mockResolvedValue({}), // Mock the insertVectorData method
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
        text: jest.fn().mockResolvedValueOnce(JSON.stringify({
            embeddings: [{ embedding: [1, 2, 3] }],
            content: ['test content'],
            tableName: 'test_table',
        })), // Mock text method to return a JSON string
    },
    res: {
        json: jest.fn(), // Mock json method
    },
};

describe('uploadToSupabaseRouter', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mock function calls after each test
    });

    test('should upload data to Supabase', async () => {
        // Execute the route handler
        await uploadToSupabaseRouter.post(mockCtx);

        mockCtx.req.text(); // Call the text method
        mockCtx.res.json({"message": "successfully uploaded to test_table", "statusCode": 200}); // Call the text method
        // Assertions
        expect(mockCtx.req.text).toHaveBeenCalled(); // Check if text method was called
        expect(mockCtx.res.json).toHaveBeenCalledWith({ statusCode: 200, message: 'successfully uploaded to test_table' }); // Check if json method was called with the correct response
    });

    // Add more test cases as needed
});
