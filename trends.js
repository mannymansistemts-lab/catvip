const API_KEY = "AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw"; // 👈 usa tu clave activa
const YT_BASE = "https://www.googleapis.com/youtube/v3";

async function obtenerTendencias(region = "MX") {
  const lista = document.getElementById("tendencias");
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
      const li = document.createElement("li");
      li.innerHTML = `<a href="https://www.youtube.com/watch?v=${id}" target="_blank">${titulo}</a> — ${canal}`;
      lista.appendChild(li);
    });

  } catch (e) {
    console.error(e);
    lista.innerHTML = `<li style="color:red;">❌ Error al cargar tendencias: ${e.message}</li>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("pais");
  obtenerTendencias(sel.value);
  sel.addEventListener("change", () => obtenerTendencias(sel.value));
});
