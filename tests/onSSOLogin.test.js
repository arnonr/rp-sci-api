// Mock axios + ssoAuth utils + Prisma
jest.mock('axios');
jest.mock('../utils/ssoAuth', () => ({
  exchangeCodeForToken: jest.fn(),
  getUserInfoFromSSO: jest.fn(),
  normalizeSSOUserInfo: jest.fn(),
}));

const axios = require('axios');
const ssoAuth = require('../utils/ssoAuth');

// Mock Prisma client to avoid real DB calls
const mockUserFindUnique = jest.fn();
const mockUserUpdate = jest.fn();
const mockUserCreate = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: mockUserFindUnique,
        update: mockUserUpdate,
        create: mockUserCreate,
      },
      $extends: () => ({
        user: {
          findUnique: mockUserFindUnique,
          update: mockUserUpdate,
          create: mockUserCreate,
        },
      }),
    })),
  };
});

const { onSSOLogin } = require('../controllers/AuthController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthController.onSSOLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SECRET_KEY = 'test-secret';
  });

  test('returns 400 when code or redirect_uri missing', async () => {
    const res = mockRes();
    await onSSOLogin({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('links existing user and returns JWT', async () => {
    ssoAuth.exchangeCodeForToken.mockResolvedValue({ access_token: 'tok' });
    ssoAuth.getUserInfoFromSSO.mockResolvedValue({ username: 'u', pid: 'p' });
    ssoAuth.normalizeSSOUserInfo.mockReturnValue({
      username: 'u', pid: 'p', email: 'u@x', firstname: 'F', surname: 'S', name: 'F S',
    });
    const existing = {
      id: 1, username: 'u', level: 1, department_id: 5,
      firstname: 'OldF', surname: 'OldS',
    };
    mockUserFindUnique.mockResolvedValue(existing);
    mockUserUpdate.mockResolvedValue({ ...existing, sso_pid: 'p' });

    const res = mockRes();
    await onSSOLogin({ body: { code: 'c', redirect_uri: 'https://app/cb' } }, res);

    expect(ssoAuth.exchangeCodeForToken).toHaveBeenCalledWith('c', 'https://app/cb');
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { username: 'u' },
        data: expect.objectContaining({
          sso_pid: 'p', firstname: 'F', surname: 'S', email: 'u@x',
        }),
      })
    );
    // Level and department_id must NOT be in the update payload
    const updateArg = mockUserUpdate.mock.calls[0][0];
    expect(updateArg.data.level).toBeUndefined();
    expect(updateArg.data.department_id).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ token: expect.any(String), username: 'u' })
    );
  });

  test('creates new user when not found', async () => {
    ssoAuth.exchangeCodeForToken.mockResolvedValue({ access_token: 'tok' });
    ssoAuth.getUserInfoFromSSO.mockResolvedValue({ username: 'new', pid: 'p-new' });
    ssoAuth.normalizeSSOUserInfo.mockReturnValue({
      username: 'new', pid: 'p-new', email: 'n@x', firstname: 'New', surname: 'User', name: 'New User',
    });
    mockUserFindUnique.mockResolvedValue(null);
    const created = {
      id: 99, username: 'new', level: 2, department_id: null,
      firstname: 'New', surname: 'User', sso_pid: 'p-new',
    };
    mockUserCreate.mockResolvedValue(created);

    const res = mockRes();
    await onSSOLogin({ body: { code: 'c', redirect_uri: 'https://app/cb' } }, res);

    expect(mockUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: 'new', sso_pid: 'p-new', level: 2, department_id: null,
          created_by: 'sso', updated_by: 'sso',
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('returns 409 on duplicate sso_pid', async () => {
    ssoAuth.exchangeCodeForToken.mockResolvedValue({ access_token: 'tok' });
    ssoAuth.getUserInfoFromSSO.mockResolvedValue({ username: 'u', pid: 'p-dup' });
    ssoAuth.normalizeSSOUserInfo.mockReturnValue({
      username: 'u', pid: 'p-dup', email: 'u@x', firstname: 'F', surname: 'S', name: 'F S',
    });
    mockUserFindUnique.mockResolvedValue({ id: 1, username: 'u' });
    const prismaError = new Error('Unique constraint failed');
    prismaError.code = 'P2002';
    prismaError.meta = { target: ['sso_pid'] };
    mockUserUpdate.mockRejectedValue(prismaError);

    const res = mockRes();
    await onSSOLogin({ body: { code: 'c', redirect_uri: 'https://app/cb' } }, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('returns 502 when token exchange fails', async () => {
    ssoAuth.exchangeCodeForToken.mockRejectedValue(new Error('network'));
    const res = mockRes();
    await onSSOLogin({ body: { code: 'c', redirect_uri: 'https://app/cb' } }, res);
    expect(res.status).toHaveBeenCalledWith(502);
  });
});
