app.get('/', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send('Falta el parámetro ?code en la URL');
  }

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
