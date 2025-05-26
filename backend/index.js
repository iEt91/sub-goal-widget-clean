import express from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});

// Endpoint que usa Streamlabs API
app.get('/subscribers', async (req, res) => {
  const streamlabsToken = req.query.token;

  if (!streamlabsToken) {
    return res.status(400).json({ error: 'Falta el token de Streamlabs' });
  }

  try {
    const response = await axios.get('https://streamlabs.com/api/v1.0/subscriptions', {
      headers: {
        Authorization: `Bearer ${streamlabsToken}`
      }
    });

    const subs = response.data?.subscriptions?.length || 0;
    res.json({ total: subs });
  } catch (error) {
    console.error('Error al obtener subs desde Streamlabs:', error.message);
    res.status(500).json({ error: 'Error al obtener subs desde Streamlabs' });
  }
});

// Servir frontend
app.use(express.static('frontend'));
