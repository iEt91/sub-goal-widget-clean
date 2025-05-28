import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import tmi from 'tmi.js';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const clientId = 'gp762nuuoqcoxypju8c569th9wz7q5';
const accessToken = '9t92yowa2wp0rdag05du4bi3dv95y9';
const metaPath = './backend/meta.json';

function loadMeta() {
  if (!fs.existsSync(metaPath)) return { current: 0, target: 1000, label: 'Meta' };
  return JSON.parse(fs.readFileSync(metaPath));
}

function saveMeta(meta) {
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
}

app.get('/subscribers', async (req, res) => {
  try {
    const userResponse = await axios.get('https://api.twitch.tv/helix/users?login=blackelespanolito', {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const broadcasterId = userResponse.data.data[0]?.id;
    if (!broadcasterId) return res.status(404).json({ error: 'No se encontró el canal' });

    const subsResponse = await axios.get(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${broadcasterId}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const meta = loadMeta();
    const total = subsResponse.data.total || 0;
    meta.current = total;
    saveMeta(meta);

    res.json({ total });
  } catch (error) {
    console.error('Error al obtener suscriptores:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al obtener suscriptores' });
  }
});

app.get('/meta', (req, res) => {
  const meta = loadMeta();
  res.json(meta);
});

// Configuración del bot de Twitch con tmi.js
const client = new tmi.Client({
  connection: { reconnect: true },
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.BOT_OAUTH_TOKEN
  },
  channels: ['blackelespanolito']
});

client.connect();

client.on('message', (channel, tags, message, self) => {
  if (self) return;

  const username = tags['display-name']?.toLowerCase();
  const isMod = tags.mod || false;
  const isBroadcaster = tags.badges?.broadcaster === '1';
  const authorized = isMod || isBroadcaster;

  if (!authorized) return;

  const meta = loadMeta();

  // Cambiar meta numérica: !meta2000
  const numericMatch = message.match(/^!meta(\d{2,5})$/);
  if (numericMatch) {
    meta.target = parseInt(numericMatch[1]);
    saveMeta(meta);
    console.log(`🎯 ${username} actualizó la meta numérica a ${meta.target}`);
    return;
  }

  // Cambiar texto de meta: !meta abrir sobres
  const textMatch = message.match(/^!meta (.+)$/i);
  if (textMatch) {
    meta.label = textMatch[1].trim();
    saveMeta(meta);
    console.log(`📝 ${username} cambió el título de meta a: "${meta.label}"`);
  }
});

app.use(express.static('frontend'));

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
