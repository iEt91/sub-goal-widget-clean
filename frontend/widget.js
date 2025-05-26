const urlParams = new URLSearchParams(window.location.search);
const targetMeta = parseInt(urlParams.get("meta")) || 0;

const ws = new WebSocket(`wss://${location.host}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const current = data.current || 0;
  document.getElementById("meta").textContent = `Meta: ${current} / ${targetMeta}`;
};
