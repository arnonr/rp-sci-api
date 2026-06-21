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

const normalizeSSOUserInfo = (userInfoData) => {
  const { username, pid, displayname, email } = userInfoData;

  if (!username) throw new Error('SSO profile is missing username');
  if (!pid) throw new Error('SSO profile is missing pid');

  const name = displayname || '';
  const parts = name.split(' ').filter(Boolean);
  const firstname = parts[0] || '';
  const surname = parts.slice(1).join(' ');

  return { username, pid, email, firstname, surname, name };
};

module.exports = { exchangeCodeForToken, getUserInfoFromSSO, normalizeSSOUserInfo };