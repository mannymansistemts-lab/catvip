// ✅ trends.js — Conexión directa a YouTube Data API v3
// Reemplaza tu clave aquí
const API_KEY = "AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw"; 

// Función principal: obtiene tendencias reales
async function obtenerTendenciasYT(regionCode = "MX", maxResults = 10) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=${regionCode}&maxResults=${maxResults}&key=${API_KEY}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error en la respuesta de la API");
    const data = await res.json();
    const tags = [];

    data.items.forEach(video => {
      if (video.snippet.tags) {
        tags.push(...video.snippet.tags);
      } else {
        // Si no hay etiquetas en el video, usamos palabras del título
        const palabras = video.snippet.title.split(" ");
        palabras.forEach(p => {
          if (p.length > 3 && !tags.includes(p)) tags.push(p);
        });
      }
    });

    // Quita duplicados, mezcla y selecciona 15
    const hashtags = [...new Set(tags)]
      .slice(0, 15)
      .map(tag => "#" + tag.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚ]/g, "").toLowerCase());

    console.log("✅ Hashtags generados desde YouTube:", hashtags);
    return hashtags;
  } catch (error) {
    console.error("❌ Error al conectar con la API de YouTube:", error);
    return generarHashtagsLocales(); // fallback local
  }
}

// Fallback local en caso de error de conexión
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

// Exporta la función global
window.obtenerTendenciasYT = obtenerTendenciasYT;
