import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

let tokenData = null;

export async function getAccessToken() {
  if (tokenData?.access_token) return tokenData.access_token;

  const res = await axios.post('https://id.twitch.tv/oauth2/token', null, {
    params: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'client_credentials'
    }
  });

  tokenData = res.data;
  return tokenData.access_token;
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
