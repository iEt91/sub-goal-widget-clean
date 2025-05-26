import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const TOKEN_PATH = './backend/token.json';

export function saveToken(data) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(data));
}

function loadToken() {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  return JSON.parse(fs.readFileSync(TOKEN_PATH));
}

async function refreshToken(oldRefreshToken) {
  const res = await axios.post('https://id.twitch.tv/oauth2/token', null, {
    params: {
      grant_type: 'refresh_token',
      refresh_token: oldRefreshToken,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET
    }
  });

  saveToken(res.data);
  return res.data.access_token;
}

export async function getAccessToken() {
  const tokenData = loadToken();
  if (!tokenData) throw new Error('No hay token almacenado. Autentica primero.');

  try {
    return tokenData.access_token;
  } catch (err) {
    return await refreshToken(tokenData.refresh_token);
  }
}

export async function getSubscriberCount(broadcaster_id) {
  const access_token = await getAccessToken();

  const res = await axios.get(`https://api.twitch.tv/helix/subscriptions`, {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Client-ID': process.env.CLIENT_ID
    },
    params: {
      broadcaster_id
    }
  });

  return res.data.total || 0;
}

export async function getBroadcasterId() {
  const access_token = await getAccessToken();

  const res = await axios.get(`https://api.twitch.tv/helix/users`, {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Client-ID': process.env.CLIENT_ID
    },
    params: {
      login: process.env.CHANNEL_NAME
    }
  });

  return res.data.data[0]?.id || null;
}
