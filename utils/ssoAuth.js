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

module.exports = { exchangeCodeForToken };