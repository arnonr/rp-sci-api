const axios = require('axios').default;

const TIMEOUT_MS = 10000;

const exchangeCodeForToken = async (code, redirectUri) => {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: process.env.SSO_CLIENT_ID,
    client_secret: process.env.SSO_CLIENT_SECRET,
  });

  const { data } = await axios.post(process.env.SSO_TOKEN_URL, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: TIMEOUT_MS,
  });

  return data;
};

const getUserInfoFromSSO = async (accessToken) => {
  const { data } = await axios.get(process.env.SSO_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: TIMEOUT_MS,
  });
  return data;
};

// KMUTNB SSO /resources/userinfo returns standard OIDC claims:
//   { sub, preferred_username, name, given_name, family_name, email, ... }
// - sub: unique subject ID at the IdP → use as both username and sso_pid
// - preferred_username: the user's preferred login (often same as sub)
// - given_name/family_name: firstname/surname
// There is no `pid` field in the default openid profile email scope.
const normalizeSSOUserInfo = (userInfoData) => {
  const sub = userInfoData?.sub ?? null;
  const username = userInfoData?.preferred_username ?? sub;
  const email = userInfoData?.email ?? null;
  const firstname = userInfoData?.given_name ?? null;
  const surname = userInfoData?.family_name ?? null;
  const name =
    userInfoData?.name ?? ([firstname, surname].filter(Boolean).join(' ') || null);

  if (!sub) throw new Error('SSO profile is missing sub');
  if (!username) throw new Error('SSO profile is missing username');

  return {
    username,
    pid: sub,
    email,
    prefix_name: null,
    firstname,
    surname,
    name,
  };
};

module.exports = { exchangeCodeForToken, getUserInfoFromSSO, normalizeSSOUserInfo };
