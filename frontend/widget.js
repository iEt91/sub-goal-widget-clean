const params = new URLSearchParams(window.location.search);

const config = {
  token: params.get('token'),
  goalAmount: parseInt(params.get('meta')) || 100
};

const metaDiv = document.getElementById('meta');
const progressDiv = document.getElementById('progress');

async function fetchSubscribers() {
  try {
    const url = `/subscribers?token=${config.token}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error || typeof data.total !== 'number') throw new Error(data.error || 'Subs inválidos');

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
