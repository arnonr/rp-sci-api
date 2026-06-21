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
    const profile = { username: 'u1', pid: 'p1', displayname: 'U One', email: 'u1@x' };
    axios.get.mockResolvedValue({ data: profile });
    const result = await getUserInfoFromSSO('tok');
    expect(result).toEqual(profile);
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

describe('ssoAuth.normalizeSSOUserInfo', () => {
  test('maps displayname to firstname/surname and keeps pid/username/email', () => {
    const raw = {
      username: 'somchai',
      pid: '1234567890123',
      displayname: 'Somchai Jaidee',
      email: 'somchai@x',
      faculty_code: 'sci',
      department_code: 'sci-cs',
    };
    const out = normalizeSSOUserInfo(raw);
    expect(out).toEqual({
      username: 'somchai',
      pid: '1234567890123',
      email: 'somchai@x',
      firstname: 'Somchai',
      surname: 'Jaidee',
      name: 'Somchai Jaidee',
    });
  });

  test('handles single-word displayname (no surname)', () => {
    const raw = { username: 'u', pid: 'p', displayname: 'Cherprang', email: 'c@x' };
    const out = normalizeSSOUserInfo(raw);
    expect(out.firstname).toBe('Cherprang');
    expect(out.surname).toBe('');
    expect(out.name).toBe('Cherprang');
  });

  test('handles 3-word displayname (joins rest as surname)', () => {
    const raw = { username: 'u', pid: 'p', displayname: 'A B C', email: 'a@x' };
    const out = normalizeSSOUserInfo(raw);
    expect(out.firstname).toBe('A');
    expect(out.surname).toBe('B C');
  });

  test('throws when username missing', () => {
    expect(() => normalizeSSOUserInfo({ pid: 'p', displayname: 'X', email: 'x@x' }))
      .toThrow('username');
  });

  test('throws when pid missing', () => {
    expect(() => normalizeSSOUserInfo({ username: 'u', displayname: 'X', email: 'x@x' }))
      .toThrow('pid');
  });
});