// Leer parámetros desde la URL
const params = new URLSearchParams(window.location.search);

const config = {
  clientId: params.get('clientId') || 'gp762nuuoqcoxypju8c569th9wz7q5',
  accessToken: params.get('accessToken') || '6s1g5z1old5ku6t6i0xg68e6gabmk8',
  channelName: params.get('channelName') || 'tangov91',
  goalAmount: parseInt(params.get('goal')) || 100
};

const metaDiv = document.getElementById('meta');
const progressDiv = document.getElementById('progress');

async function fetchSubscribers() {
  try {
    const url = `/subscribers?clientId=${config.clientId}&accessToken=${config.accessToken}&channelName=${config.channelName}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error || !data.total) throw new Error(data.error || 'Sin subs');

    const current = data.total;
    const target = config.goalAmount;
    const porcentaje = Math.min(100, Math.round((current / target) * 100));

    metaDiv.textContent = `Meta: ${current} / ${target}`;
    progressDiv.textContent = `Progreso: ${porcentaje}%`;
  } catch (err) {
    metaDiv.textContent = 'Error';
    progressDiv.textContent = '';
    console.error('Error al cargar subs:', err);
  }
}

setInterval(fetchSubscribers, 5000);
fetchSubscribers();
