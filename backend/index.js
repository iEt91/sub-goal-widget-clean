import express from 'express';
import { WebSocketServer } from 'ws';
import { getBroadcasterId, getSubscriberCount } from './twitch.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = app.listen(process.env.PORT, () =>
  console.log(`Servidor en puerto ${process.env.PORT}`)
);

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

async function updateSubs() {
  const broadcaster_id = await getBroadcasterId();
  const currentSubs = await getSubscriberCount(broadcaster_id);
  const data = JSON.parse(fs.readFileSync('./backend/meta.json'));
  data.current = currentSubs;
  fs.writeFileSync('./backend/meta.json', JSON.stringify(data));
  broadcast(data);
}

setInterval(updateSubs, 60_000); // actualiza cada 60 segundos
updateSubs();

app.use(express.static('frontend'));
