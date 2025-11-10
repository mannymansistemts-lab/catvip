// trends.js — versión estable para GitHub Pages
const API_KEY = "AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw"; // reemplázala con tu clave real
const YT_BASE = "https://www.googleapis.com/youtube/v3";
const PROXY = "https://api.codetabs.com/v1/proxy/?quest="; // proxy seguro y rápido

async function buscarVideosYT(query, region = "MX") {
  const endpoint = `${YT_BASE}/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&regionCode=${region}&key=${API_KEY}`;
  const fullUrl = `${PROXY}${encodeURIComponent(endpoint)}`;
  try {
    const res = await fetch(fullUrl, { cache: "no-store", mode: "cors" });
    if (!res.ok) throw new Error("Conexión fallida");
    const data = await res.json();
    if (!data.items) throw new Error("Respuesta inválida de API");
    return data;
  } catch (e) {
    console.warn("⚠️ Error o sin conexión, usando hashtags locales:", e.message);
    return { items: [] };
  }
}

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

function generarHashtagsLocales() {
  return [
    "#catalogos2025", "#moda", "#belleza", "#cosmeticos",
    "#perfumes", "#ofertas", "#rebajas", "#ventasporcatalogo",
    "#emprendedoras", "#latam", "#nuevocatalogo", "#tendencias2025"
  ];
}

async function obtenerHashtagsYT(query) {
  const data = await buscarVideosYT(query);
  const hashtags = extraerHashtags(data.items);
  return hashtags;
}

window.obtenerHashtagsYT = obtenerHashtagsYT;
