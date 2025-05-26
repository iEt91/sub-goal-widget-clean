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

// Actualización periódica de suscriptores
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

// Ruta para recibir ?code=... si Twitch redirige a "/"
app.get('/', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.sendFile(process.cwd() + '/frontend/index.html');
  }

  try {
    const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.CLIENT_ID,
