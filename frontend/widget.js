const urlParams = new URLSearchParams(window.location.search);
const targetMeta = parseInt(urlParams.get("meta")) || 0;

const ws = new WebSocket(`wss://${location.host}`);

ws.onmessage = async (event) => {
  const text = await event.data.text(); // Forzamos a leer el contenido como texto
  const data = JSON.parse(text);
  const current = data.current || 0;
  document.getElementById("meta").textContent = `Meta: ${current} / ${targetMeta}`;
};
