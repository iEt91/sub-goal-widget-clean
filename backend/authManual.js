// backend/authManual.js
import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const CODE = 'triimbizysb9sljupvrv7csyaig8dq';

async function exchangeCode() {
  try {
    const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

    console.log('Usando REDIRECT_URI:', REDIRECT_URI); // <-- verifica que lo lea bien

    const res = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: CODE,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
      }
    });

    fs.writeFileSync('./backend/token.json', JSON.stringify(res.data, null, 2));
    console.log('✅ Token guardado correctamente en backend/token.json');
  } catch (err) {
    console.error('❌ Error al intercambiar el código:', err.response?.data || err.message);
  }
}

exchangeCode();
