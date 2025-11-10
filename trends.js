// ======== TENDENCIAS DE YOUTUBE MÉXICO ========
// ✅ Coloca aquí tu API Key activa de YouTube Data API v3
const API_KEY = "AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw";

// Configuración base
const REGION = "MX";
const MAX_RESULTS = 10;
const LANG = "es";

const $ = id => document.getElementById(id);

// Función para obtener datos JSON desde la API
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

async function cargarTendencias() {
  const status = $("status");
  const lista = $("tendencias");

  status.textContent = "Conectando con YouTube...";
  try {
    // URL segura y compatible con claves simples
    const url = `https://youtube.googleapis.com/youtube/v3/videos?` +
      `part=snippet,statistics&chart=mostPopular&regionCode=${REGION}` +
      `&maxResults=${MAX_RESULTS}&hl=${LANG}&key=${API_KEY}`;

    const data = await fetchJson(url);
    if (!data.items || !data.items.length) {
      throw new Error("No se recibieron datos de tendencias (items vacío).");
    }

    lista.innerHTML = "";
    data.items.forEach(video => {
      const id = video.id;
      const title = video.snippet.title;
      const channel = video.snippet.channelTitle;
      const thumb = video.snippet.thumbnails.medium.url;
      const views = video.statistics?.viewCount ? Number(video.statistics.viewCount).toLocaleString() : "N/A";

      const li = document.createElement("li");
      li.innerHTML = `
        <img src="${thumb}" alt="${title}">
        <div>
          <a href="https://www.youtube.com/watch?v=${id}" target="_blank">${title}</a><br>
          👤 ${channel}<br>
          👁️ ${views} vistas
        </div>
      `;
      lista.appendChild(li);
    });

    status.textContent = "✅ Tendencias cargadas correctamente.";
  } catch (err) {
    status.textContent = `❌ Error al cargar tendencias: ${err.message}`;
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", cargarTendencias);
