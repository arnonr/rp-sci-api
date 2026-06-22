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

describe('ssoAuth.getUserInfoFromSSO', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SSO_USERINFO_URL = 'https://sso.test/userinfo';
  });

  test('returns raw userinfo on success', async () => {
    const data = { sub: 's1', preferred_username: 'u1' };
    axios.get.mockResolvedValue({ data });
    const result = await getUserInfoFromSSO('tok');
    expect(result).toEqual(data);
    expect(axios.get).toHaveBeenCalledWith(
      'https://sso.test/userinfo',
      expect.objectContaining({ headers: { Authorization: 'Bearer tok' } })
    );
  });

  test('throws on 401', async () => {
    axios.get.mockRejectedValue({ response: { status: 401 } });
    await expect(getUserInfoFromSSO('bad-tok')).rejects.toBeDefined();
  });
});

// KMUTNB SSO returns standard OIDC claims: sub, preferred_username, name, given_name, family_name, email
describe('ssoAuth.normalizeSSOUserInfo', () => {
  test('maps OIDC claims to user fields using sub as pid', () => {
    const raw = {
      sub: 'arnonr',
      preferred_username: 'arnonr',
      name: 'Arnon Rukjak',
      given_name: 'Arnon',
      family_name: 'Rukjak',
      email: 'arnonr@kmutnb.ac.th',
      email_verified: true,
    };
    const out = normalizeSSOUserInfo(raw);
    expect(out).toEqual({
      username: 'arnonr',
      pid: 'arnonr',
      email: 'arnonr@kmutnb.ac.th',
      prefix_name: null,
      firstname: 'Arnon',
      surname: 'Rukjak',
      name: 'Arnon Rukjak',
    });
  });

  test('falls back to sub when preferred_username missing', () => {
    const raw = { sub: 's2', email: 's2@x' };
    const out = normalizeSSOUserInfo(raw);
    expect(out.username).toBe('s2');
    expect(out.pid).toBe('s2');
  });

  test('builds name from given_name + family_name when name is missing', () => {
    const raw = { sub: 's3', preferred_username: 'u3', given_name: 'A', family_name: 'B' };
    const out = normalizeSSOUserInfo(raw);
    expect(out.name).toBe('A B');
  });

  test('handles missing optional fields (returns nulls, not crash)', () => {
    const raw = { sub: 's4' };
    const out = normalizeSSOUserInfo(raw);
    expect(out).toEqual({
      username: 's4',
      pid: 's4',
      email: null,
      prefix_name: null,
      firstname: null,
      surname: null,
      name: null,
    });
  });

  test('throws when sub is missing', () => {
    expect(() => normalizeSSOUserInfo({})).toThrow('sub');
  });
});
