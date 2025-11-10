// ✅ trends.js — obtiene hashtags desde la API de YouTube o usa respaldo local
const API_KEY = "AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw"; // ← pon aquí tu clave YouTube Data API v3

async function obtenerTendenciasYT(regionCode = "MX", maxResults = 15) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=${regionCode}&maxResults=${maxResults}&key=${API_KEY}`;
  try {
    const res = await fetch(url, { cache: "no-store" }); // fuerza sin cache
    if (!res.ok) throw new Error("Error en la respuesta de la API");
    const data = await res.json();

    const tags = [];
    data.items.forEach(video => {
      if (video.snippet.tags) {
        tags.push(...video.snippet.tags);
      } else {
        const palabras = video.snippet.title.split(" ");
        palabras.forEach(p => {
          if (p.length > 3 && !tags.includes(p)) tags.push(p);
        });
      }
    });

    // Limpieza y normalización
    const hashtags = [...new Set(tags)]
      .slice(0, 20)
      .map(tag => "#" + tag.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚ]/g, "").toLowerCase());

    console.log("✅ Hashtags desde YouTube:", hashtags);
    return hashtags;
  } catch (error) {
    console.error("❌ Error al conectar con YouTube API:", error);
    return generarHashtagsLocales();
  }
}

function generarHashtagsLocales() {
  const tags = [
    "#catalogos2025", "#moda", "#belleza", "#perfumes",
    "#rebajas", "#ofertas", "#modafemenina", "#ventasporcatalogo",
    "#productosnuevos", "#emprendedores", "#catálogos", "#latam",
    "#tendencias", "#influencer", "#cosmeticos"
  ];
  console.warn("⚠️ Usando hashtags locales de respaldo.");
  return tags;
}

window.obtenerTendenciasYT = obtenerTendenciasYT;
