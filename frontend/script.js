const ws = new WebSocket(`ws://${location.host}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  document.getElementById('subGoal').textContent = `${data.current} / ${data.target}`;
};
