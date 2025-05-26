import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const clientId = 'gp762nuuoqcoxypju8c569th9wz7q5';
const accessToken = '9t92yowa2wp0rdag05du4bi3dv95y9';

app.get('/subscribers', async (req, res) => {
  try {
    // Obtener el broadcaster_id de blackelespanolito
    const userResponse = await axios.get('https://api.twitch.tv/helix/users?login=blackelespanolito', {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const broadcasterId = userResponse.data.data[0]?.id;

    if (!broadcasterId) {
      return res.status(404).json({ error: 'No se encontró el canal' });
    }

    // Obtener la cantidad de suscriptores
    const subsResponse = await axios.get(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${broadcasterId}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const total = subsResponse.data.total || 0;
    res.json({ total });
  } catch (error) {
    console.error('Error al obtener suscriptores:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al obtener suscriptores' });
  }
});

app.use(express.static('frontend'));

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
