import express from 'express';
import { WebSocketServer } from 'ws';
import { getBroadcasterId, getSubscriberCount, saveToken } from './twitch.js';
import fs from 'fs';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const app = express();
const server = app.listen(process.env.PORT, () =>
  console.log(`Servidor en puerto ${process.env.PORT}`)
);

// WebSocket setup
const wss = new WebSocketServer({ server });
let connections = [];

wss.on('connection', (ws) => {
  connections.push(ws);
  sendCurrentState(ws);
  ws.on('close', () => connections = connections.filter(conn => conn !== ws));
});

function broadcast(state) {
  connections.forEach(ws => ws.send(JSON.stringify(state)));
}

function sendCurrentState(ws) {
  const raw = fs.readFileSync('./backend/meta.json');
  ws.send(raw);
}

// Actualización periódica de subs (opcional si usás /subscribers directo)
async function updateSubs() {
  try {
    const broadcaster_id = await getBroadcasterId();
    const currentSubs = await getSubscriberCount(broadcaster_id);
    const data = JSON.parse(fs.readFileSync('./backend/meta.json'));
    data.current = currentSubs;
    fs.writeFileSync('./backend/meta.json', JSON.stringify(data));
    broadcast(data);
  } catch (err) {
    console.error('Error actualizando subs:', err.message);
  }
}
setInterval(updateSubs, 60_000);
updateSubs();

// Ruta raíz para capturar code de Twitch
app.get('/', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.sendFile(process.cwd() + '/frontend/index.html');

  try {
    const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.REDIRECT_URI
      }
    });

    saveToken(tokenRes.data);
    res.send('✅ Token guardado correctamente. Puedes cerrar esta ventana.');
  } catch (err) {
    res.status(500).send('❌ Error al intercambiar el código: ' + JSON.stringify(err.response?.data || err.message));
  }
});

// Endpoint de suscriptores directo (/subscribers)
app.get('/subscribers', async (req, res) => {
  try {
    const clientId = req.query.clientId || process.env.TWITCH_CLIENT_ID;
    const token = req.query.accessToken || process.env.TWITCH_TOKEN;
    const channelName = req.query.channelName || 'tangov91';

    // Obtener Channel ID
    const userResponse = await axios.get(`https://api.twitch.tv/helix/users?login=${channelName}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`
      }
    });
    const channelId = userResponse.data.data[0].id;

    // Obtener suscriptores
    const subsResponse = await axios.get(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${channelId}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`
      }
    });

    res.json({ total: subsResponse.data.total });
  } catch (error) {
    console.error('Error en /subscribers:', error.message);
    res.status(500).json({ error: 'Error al obtener suscriptores' });
  }
});

// Servir archivos frontend
app.use(express.static('frontend'));
