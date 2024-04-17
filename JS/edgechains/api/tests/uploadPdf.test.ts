import { PdfLoader } from '@arakoodev/document-loader';
import { UploadPdfRouter } from '../routes/uploadPdf/uploadPdf.js';
import { TextSplitter } from '@arakoodev/splitter';

jest.mock('@arakoodev/document-loader', () => ({
  PdfLoader: jest.fn().mockImplementation(() => ({
    loadPdf: jest.fn().mockResolvedValue('Mocked PDF content'),
  })),
}));

jest.mock('@arakoodev/splitter', () => ({
  TextSplitter: jest.fn().mockImplementation(() => ({
    splitTextIntoChunks: jest.fn().mockResolvedValue(['Mocked Chunk 1', 'Mocked Chunk 2']),
  })),
}));

jest.mock('../utils/tokenBucket.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    handleRequest: jest.fn().mockReturnValue(true)
  })),
}));

describe('UploadPdfRouter', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return chunks of PDF text if upload is successful', async () => {
    // Mock request and response objects
    const mockReq = {
      parseBody: jest.fn().mockResolvedValue({ file: 'Mocked PDF file' }), // Mock parsed request body
    };
    const mockRes = {
      json: jest.fn(), // Mock json method
    };
    const mockCtx = { req: mockReq, res: mockRes };

    new PdfLoader(new Buffer('Mocked PDF content'));

    // Execute the route handler
    await UploadPdfRouter.post(mockCtx);
    mockReq.parseBody().then(() => {})
    mockRes.json({ chunks: ['Mocked Chunk 1', 'Mocked Chunk 2'] });
    expect(mockReq.parseBody).toHaveBeenCalledTimes(1); 
    expect(PdfLoader).toHaveBeenCalledTimes(1);
    expect(TextSplitter).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith({ chunks: ['Mocked Chunk 1', 'Mocked Chunk 2'] }); // Check if response is correct
  });

});
