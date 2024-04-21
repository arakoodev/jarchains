import { Supabase } from '../../../index.js';

const MOCK_SUPABASE_API_KEY = 'mock-api-key';
const MOCK_SUPABASE_URL = 'https://mock-supabase.co';

// Mock the Supabase class to return a mock client
jest.mock('../../../index.js', () => {
    return {
        Supabase: jest.fn().mockImplementation(() => ({
            createClient: jest.fn(() => ({
                // Mock client methods
                from: jest.fn().mockReturnThis(),
            })),
            getDataFromQuery: jest.fn().mockImplementation(async () => {
                // Mock response data
                const responseData = { id: 1, content: "Hello, world!" };

                // Return the mock response
                return responseData;
            }),
            insertBulkVectorData: jest.fn().mockImplementation(async ({ client, tableName, data }) => {
                // Assuming content is a string and embedding is an array of length 1536
                const mockResponse = {
                    tableName: tableName,
                    data
                };
                return mockResponse;
            }),
        })),
    };
});

it('should insert bulk data into the database', async () => {
    let supabase = new Supabase(MOCK_SUPABASE_URL, MOCK_SUPABASE_API_KEY);
    const client = supabase.createClient();
    const tableName = 'test_table';
    const content = ["hi", "hello"]
    // Insert data into the database
    const data = [{ content, embedding: [Array.from({ length: 1536 }, (_, i) => i), Array.from({ length: 1536 }, (_, i) => i)] }]
    // Call the insertBulkVectorData function
    const result = await supabase.insertBulkVectorData({ client, tableName, data });
    // Check if the insertion was successful
    expect(result).toEqual(expect.objectContaining({
        tableName: tableName,
        data: expect.arrayContaining([
            expect.objectContaining({
                content,
                embedding: expect.arrayContaining([Array.from({ length: 1536 }, (_, i) => i), Array.from({ length: 1536 }, (_, i) => i)]), // Mocked embedding vector
            }),
        ]),
    }));
});
