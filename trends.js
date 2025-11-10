// ✅ trends.js para GitHub Pages (con proxy y conexión a YouTube API)
const API_KEY = "AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw"; // ← tu clave real de YouTube Data API v3
const PROXY = "https://api.allorigins.win/raw?url="; // evita CORS
const YT_BASE = "https://www.googleapis.com/youtube/v3";

// Función para buscar videos relacionados
async function buscarVideosYT(query, region = "MX") {
  const url = `${PROXY}${encodeURIComponent(
    `${YT_BASE}/search?part=snippet&type=video&maxResults=10&q=${query}&regionCode=${region}&key=${API_KEY}`
  )}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al conectar a YouTube");
  return res.json();
}

// Extraer hashtags de los títulos y descripciones
function extraerHashtags(videos) {
  const hashtags = [];
  videos.forEach((v) => {
    const sn = v.snippet;
    const desc = sn.description || "";
    const title = sn.title || "";
    const encontrados = (desc + " " + title).match(/#[A-Za-z0-9_áéíóúñ]+/g) || [];
    encontrados.forEach((h) => {
      if (!hashtags.includes(h.toLowerCase())) hashtags.push(h.toLowerCase());
    });
  });
  return hashtags.length ? hashtags : generarHashtagsLocales();
}

// Hashtags de respaldo locales
function generarHashtagsLocales() {
  return [
    "#catalogos2025", "#moda", "#belleza", "#cosmeticos", "#perfumes",
    "#ofertas", "#rebajas", "#ventasporcatalogo", "#productosnuevos",
    "#emprendedoras", "#latam", "#nuevocatalogo", "#tendencias2025"
  ];
}

// Función principal
async function obtenerHashtagsYT(query) {
  try {
    const data = await buscarVideosYT(query);
    const hashtags = extraerHashtags(data.items);
    console.log("✅ Hashtags generados desde YouTube:", hashtags);
    return hashtags;
  } catch (err) {
    console.error("❌ Error al conectar con la API:", err);
    return generarHashtagsLocales();
  }
}

window.obtenerHashtagsYT = obtenerHashtagsYT;
