const params = new URLSearchParams(window.location.search);

const config = {
  goalAmount: parseInt(params.get('meta')) || 100
};

const metaDiv = document.getElementById('meta');

async function fetchSubscribers() {
  try {
    const res = await fetch('/subscribers');
    const data = await res.json();

    if (data.error || typeof data.total !== 'number') throw new Error(data.error || 'Subs inválidos');

    const current = data.total;
    const target = config.goalAmount;

    metaDiv.textContent = `Meta: ${current} / ${target}`;
  } catch (err) {
    metaDiv.textContent = 'Error al cargar subs';
    console.error('Error al cargar subs:', err);
  }
}

setInterval(fetchSubscribers, 5000);
fetchSubscribers();
