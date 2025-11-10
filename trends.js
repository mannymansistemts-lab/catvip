// trends.js - versión final corregida
// Pon tu API key aquí
const API_KEY = "AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw"; 

const YT_BASE = "https://www.googleapis.com/youtube/v3";

// Función principal para cargar tendencias y hashtags virales
async function cargarTendencias() {
  const url = `${YT_BASE}/videos?part=snippet&chart=mostPopular&regionCode=MX&maxResults=20&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error HTTP " + res.status);
    const data = await res.json();

    const lista = document.getElementById("tendencias");
    lista.innerHTML = "";

    let hashtags = new Set();

    data.items.forEach(video => {
      // Mostrar títulos en la lista
      const li = document.createElement("li");
      li.textContent = video.snippet.title;
      lista.appendChild(li);

      // Extraer hashtags desde snippet.tags
      if (video.snippet.tags) {
        video.snippet.tags.forEach(tag => {
          const hashtag = "#" + tag.replace(/ /g, "").toLowerCase();
          if (hashtag.length < 25) hashtags.add(hashtag);
        });
      }

      // Extraer hashtags desde descripción (#algo)
      const desc = video.snippet.description || "";
      const encontrados = desc.match(/#[A-Za-z0-9_]+/g);
      if (encontrados) {
        encontrados.forEach(h => hashtags.add(h.toLowerCase()));
      }
    });

    // Convertir a Array y seleccionar solo los más relevantes
    window.hashtagsVirales = Array.from(hashtags).slice(0, 20);

    console.log("✅ Hashtags virales cargados:", window.hashtagsVirales);

  } catch (err) {
    document.getElementById("tendencias").innerHTML =
      "<li>No se pudieron cargar tendencias</li>";
    window.hashtagsVirales = [];
    console.warn("⚠ Error en cargarTendencias:", err);
  }
}

// Integrarse con tu botón y tu HTML
window.generarSEO = function () {
  const titulo = document.getElementById("titulo").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const año = new Date().getFullYear();

  if (!titulo || !descripcion) {
    alert("Por favor llena ambos campos");
    return;
  }

  // Mezclar tus hashtags + los virales
  const base = [
    "#catalogosdigitales", "#ventasporcatalogo", "#productosnuevos",
    "#bellezayestilo", "#emprendedoras"
  ];

  const hashtagsFinales = [
    ...base,
    ...(window.hashtagsVirales || []).slice(0, 12)
  ];

  const resultado = `
📢 TÍTULO SUGERIDO:
${titulo} ${año} | Ofertas y Novedades

📝 DESCRIPCIÓN:
${descripcion}

🔥 HASHTAGS VIRAL + SEO:
${hashtagsFinales.join(" ")}

🏷️ ETIQUETAS (YouTube Studio):
${titulo.toLowerCase()}, ${titulo.toLowerCase()} ${año}, catálogo ${año}, ofertas catálogo, ${hashtagsFinales.join(", ")}

⏰ MEJORES HORARIOS (MX):
12:00-13:00, 18:00-19:00, 21:00-22:00

💡 Alternativa de título:
${titulo} — Catálogo ${año} (Lo más nuevo)
`;

  document.getElementById("resultado").textContent = resultado;
};

// Ejecutar tendencias automáticamente al cargar la página
cargarTendencias();
