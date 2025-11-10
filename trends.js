// ✅ Reemplaza con tu clave de YouTube Data API v3
const API_KEY = "AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw";
const REGION = "MX"; // 🇲🇽
const LANG = "es";
const MAX_RESULTS = 10;

const $ = id => document.getElementById(id);

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

async function cargarTendencias() {
  const status = $("status");
  const lista = $("tendencias");
  status.textContent = "Cargando tendencias... 🔄";
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet,statistics&chart=mostPopular&regionCode=${REGION}&hl=${LANG}` +
      `&maxResults=${MAX_RESULTS}&key=${API_KEY}`;
      
    const data = await fetchJson(url);
    if (!data.items) throw new Error("Respuesta vacía de YouTube");

    lista.innerHTML = "";
    data.items.forEach(video => {
      const li = document.createElement("li");
      const title = video.snippet.title;
      const channel = video.snippet.channelTitle;
      const videoId = video.id;
      const views = video.statistics?.viewCount || 0;

      li.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">${title}</a><br>
        👤 ${channel} — 👁️ ${Number(views).toLocaleString()} vistas
      `;
      lista.appendChild(li);
    });

    status.textContent = "Tendencias actualizadas ✅";
  } catch (err) {
    status.textContent = `❌ Error al cargar tendencias: ${err.message}`;
  }
}

// Ejecutar al cargar
document.addEventListener("DOMContentLoaded", cargarTendencias);
