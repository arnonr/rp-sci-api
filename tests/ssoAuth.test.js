const axios = require('axios');
const { exchangeCodeForToken, getUserInfoFromSSO, normalizeSSOUserInfo } =
  require('../utils/ssoAuth');

jest.mock('axios');

describe('ssoAuth.exchangeCodeForToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SSO_TOKEN_URL = 'https://sso.test/token';
    process.env.SSO_CLIENT_ID = 'test-client';
    process.env.SSO_CLIENT_SECRET = 'test-secret';
  });

  test('returns access_token on success', async () => {
    axios.post.mockResolvedValue({
      data: { access_token: 'abc123', token_type: 'Bearer', expires_in: 3600 }
    });
    const result = await exchangeCodeForToken('the-code', 'https://app.test/cb');
    expect(result.access_token).toBe('abc123');
    expect(axios.post).toHaveBeenCalledWith(
      'https://sso.test/token',
      expect.any(URLSearchParams),
      expect.objectContaining({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    );
  });

  test('throws on network error', async () => {
    axios.post.mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(exchangeCodeForToken('code', 'https://app.test/cb'))
      .rejects.toThrow('ECONNREFUSED');
  });

  test('throws on 4xx response', async () => {
    axios.post.mockRejectedValue({
      response: { status: 400, data: { error: 'invalid_grant' } }
    });
    await expect(exchangeCodeForToken('bad-code', 'https://app.test/cb'))
      .rejects.toBeDefined();
  });
});