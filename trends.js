// === trends.js ===
// API YouTube
const API_KEY = 'AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const $ = id => document.getElementById(id);

// Función principal
async function generarSEO() {
  const brand = $('titulo').value.trim();
  const desc = $('descripcion').value.trim();
  if (!brand || !desc) return alert('Completa ambos campos.');

  $('status').textContent = '🔍 Conectando con la API de YouTube...';
  $('resultado').textContent = '';

  let tags = [], titles = [];

  try {
    const q = encodeURIComponent(`${brand} catálogo 2025`);
    const res = await fetch(`${BASE_URL}/search?part=snippet&type=video&maxResults=10&q=${q}&regionCode=MX&key=${API_KEY}`);
    const data = await res.json();

    if (!data.items) throw new Error('Sin items');

    tags = data.items
      .flatMap(v => (v.snippet.tags || []))
      .filter(t => t.length < 30);

    titles = data.items.map(v => v.snippet.title);
    $('status').textContent = '✅ Conectado a la API de YouTube';
  } catch (e) {
    $('status').textContent = '⚠️ No se pudo conectar a la API, usando hashtags locales.';
    tags = ['#moda2025', '#catalogosdigitales', '#bellezaymoda', '#rebajas', '#ofertas', '#ventasporcatalogo', '#cosmeticos', '#emprendedoras'];
    titles = ['Catálogo Avon 2025', 'Novedades Price Shoes 2025', 'Tendencias de moda y calzado'];
  }

  // Limpiar y combinar hashtags
  const clean = tags
    .map(t => t.replace(/[^a-zA-Z0-9áéíóúñ#]/g, '').toLowerCase())
    .slice(0, 15);

  const hashtags = Array.from(new Set(clean));

  // Generar SEO profesional
  const year = new Date().getFullYear();
  const mainTitle = `👠 ${brand} ${year} | Catálogo completo y ofertas exclusivas 💄`;
  const altTitle = `${brand} ${year} — Catálogo digital (Lo más nuevo)`;

  const fullDesc = `${desc}

Explora las mejores promociones y productos del catálogo ${brand} ${year}. Ideal para emprendedoras, revendedoras y amantes de la moda, el calzado y los cosméticos. 💅

✨ SUSCRÍBETE para más catálogos y novedades cada semana.
#CatalogosVirtualesLatam #VendeMasPorCatalogos`;

  const etiquetas = [
    `${brand} ${year}`, `${brand} catálogo`, 'catálogos digitales', 'ventas por catálogo',
    'belleza', 'moda', 'cosméticos', 'emprendedoras', 'rebajas', 'ofertas 2025'
  ];

  const resultado = `
📢 TÍTULO:
${mainTitle}

📝 DESCRIPCIÓN:
${fullDesc}

🔥 HASHTAGS:
${hashtags.join(' ')}

🏷️ ETIQUETAS:
${etiquetas.join(', ')}

💡 SUGERENCIA EXTRA:
${altTitle}
`;

  $('resultado').textContent = resultado;

  // Mostrar tendencias
  const ul = $('tendencias');
  ul.innerHTML = '';
  titles.forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    ul.appendChild(li);
  });
}

// Evento
document.addEventListener('DOMContentLoaded', () => {
  $('generarBtn').addEventListener('click', generarSEO);
});
