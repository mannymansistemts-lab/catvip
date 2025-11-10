const API_KEY = "AIzaSyDlYWhDkEPsAIjedRk5Hnxs0bfAA7950EI"; // Coloca tu API key activa
const YT_BASE = "https://www.googleapis.com/youtube/v3";
const lista = document.getElementById("tendencias");

async function obtenerTendencias(region="MX") {
  lista.innerHTML = "<li>Cargando tendencias...</li>";
  try {
    const url = `${YT_BASE}/videos?part=snippet,statistics&chart=mostPopular&regionCode=${region}&hl=es&maxResults=10&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${data.error?.message || "Error desconocido"}`);
    if (!data.items || data.items.length === 0) {
      lista.innerHTML = "<li>No hay tendencias disponibles.</li>";
      return;
    }

    lista.innerHTML = "";
    data.items.forEach(v => {
      const titulo = v.snippet.title;
      const canal = v.snippet.channelTitle;
      const id = v.id;

      // Generar hashtags SEO automáticamente a partir del título
      const hashtagsSEO = titulo
        .toLowerCase()
        .replace(/[^a-z0-9 ]/gi, "")
        .split(" ")
        .filter(w => w.length>2)
        .map(w => "#" + w)
        .join(" ");

      // Generar etiquetas SEO automáticamente
      const etiquetasSEO = [
        titulo.toLowerCase(),
        titulo.toLowerCase() + " youtube",
        canal.toLowerCase(),
        "tendencias youtube",
        "videos populares"
      ].join(", ");

      const li = document.createElement("li");
      li.innerHTML = `
        <a href="https://www.youtube.com/watch?v=${id}" target="_blank">${titulo}</a> — ${canal}<br>
        🔥 Hashtags SEO: ${hashtagsSEO}<br>
        🏷️ Etiquetas SEO: ${etiquetasSEO}
      `;
      lista.appendChild(li);
    });

  } catch(e) {
    lista.innerHTML = `<li style="color:red;">❌ Error al cargar tendencias: ${e.message}</li>`;
  }
}

// Ejecutar al cargar la página y al cambiar país
document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("pais");
  obtenerTendencias(sel.value);
  sel.addEventListener("change", () => obtenerTendencias(sel.value));
});

// Función SEO para el formulario manual
function generarSEO() {
  const titulo = document.getElementById("titulo").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  if(!titulo || !descripcion) return alert("Por favor llena ambos campos");

  const año = new Date().getFullYear();

  // Hashtags SEO del título
  const hashtags = titulo
    .toLowerCase()
    .replace(/[^a-z0-9 ]/gi,"")
    .split(" ")
    .filter(w => w.length>2)
    .map(w => "#" + w);

  // Etiquetas SEO largas
  const etiquetas = [
    titulo.toLowerCase(),
    `${titulo.toLowerCase()} ${año}`,
    "videos populares youtube",
    "tendencias youtube 2025"
  ];

  document.getElementById("resultado").textContent = `
📢 TÍTULO SUGERIDO:
${titulo} ${año}

📝 DESCRIPCIÓN:
${descripcion}

🔥 HASHTAGS SEO:
${hashtags.join(" ")}

🏷️ ETIQUETAS SEO:
${etiquetas.join(", ")}
  `;
}
