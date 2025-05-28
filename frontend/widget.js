const params = new URLSearchParams(window.location.search);
const metaDiv = document.getElementById('meta');

async function fetchMeta() {
  try {
    const [subsRes, metaRes] = await Promise.all([
      fetch('/subscribers'),
      fetch('/meta')
    ]);

    const subsData = await subsRes.json();
    const metaData = await metaRes.json();

    if (subsData.error || typeof subsData.total !== 'number') throw new Error(subsData.error || 'Subs inválidos');

    metaDiv.textContent = `${metaData.label}: ${subsData.total} / ${metaData.target}`;
  } catch (err) {
    metaDiv.textContent = 'Error al cargar meta';
    console.error('Error al cargar meta:', err);
  }
}

setInterval(fetchMeta, 5000);
fetchMeta();