import request from 'supertest';
import app  from '../index.js';

describe('StreamingRouter', () => {

  it('should return a 200 response for a valid question', async () => {
    const question = 'What is the capital of France?';
    const response = await request(app)
     .get(`/v1/getStreamData/${question}`)
     .expect(200);

    expect(response.text).toContain('The capital of France is Paris.');
  });

  it('should return a 429 response when the rate limit is exceeded', async () => {
    const question = 'What is the capital of France?';
    await request(app)
     .get(`/v1/getStreamData/${question}`)
     .expect(200);

    const response = await request(app)
     .get(`/v1/getStreamData/${question}`)
     .expect(429);

    expect(response.body.message).toBe('Rate limit exceeded');
  });

  it('should return a 500 response for an invalid question', async () => {
    const question = 'Invalid question';
    const response = await request(app)
     .get(`/v1/getStreamData/${question}`)
     .expect(500);

    expect(response.body.error).toBeDefined();
  });
});