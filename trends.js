const API_KEY = "AIzaSyDlYWhDkEPsAIjedRk5Hnxs0bfAA7950EI"; // tu API key de YouTube
const YT_BASE = "https://www.googleapis.com/youtube/v3";
const lista = document.getElementById("tendencias");
const AÑO = new Date().getFullYear();

// Función para extraer palabras clave del título y descripción
function extraerPalabrasClave(titulo, descripcion, nicho) {
    const texto = (titulo + " " + descripcion).toLowerCase().replace(/[^a-z0-9\s]/gi,"");
    const palabras = texto.split(/\s+/).filter(w => w.length>2 && (nicho.some(k => w.includes(k))));
    return [...new Set(palabras)];
}

// Generar hashtags SEO 100% reales
function generarHashtags(titulo, descripcion, nicho){
    let palabras = extraerPalabrasClave(titulo, descripcion, nicho);
    if(palabras.length === 0) palabras = ["catalogo","cosmeticos","calzado","ventas"]; // fallback mínimo
    const hashtags = palabras.slice(0,5).map(w => "#"+w.charAt(0).toUpperCase() + w.slice(1)+AÑO);
    return hashtags;
}

// Generar etiquetas long-tail SEO
function generarEtiquetas(titulo, descripcion, canal, nicho){
    const palabras = extraerPalabrasClave(titulo, descripcion, nicho);
    const etiquetas = [
        titulo,
        `${titulo} ${AÑO}`,
        canal,
        ...palabras,
        "tendencias youtube",
        "videos populares"
    ];
    return [...new Set(etiquetas)].join(", ");
}

// Función para obtener tendencias desde YouTube
async function obtenerTendencias(region="MX"){
    lista.innerHTML = "<li>Cargando tendencias...</li>";
    const NICHO_KEYWORDS = ["catalogo","cosmeticos","calzado","ventas","ofertas","productos","tendencias","moda","emprendedoras"];

    try {
        const url = `${YT_BASE}/videos?part=snippet,statistics&chart=mostPopular&regionCode=${region}&hl=es&maxResults=10&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if(!res.ok) throw new Error(`HTTP ${res.status}: ${data.error?.message || "Error desconocido"}`);
        if(!data.items || data.items.length===0){
            lista.innerHTML = "<li>No hay tendencias disponibles.</li>";
            return;
        }

        lista.innerHTML = "";
        data.items.forEach(video => {
            const titulo = video.snippet.title;
            const descripcion = video.snippet.description;
            const canal = video.snippet.channelTitle;
            const id = video.id;

            const hashtags = generarHashtags(titulo, descripcion, NICHO_KEYWORDS).join(" ");
            const etiquetas = generarEtiquetas(titulo, descripcion, canal, NICHO_KEYWORDS);

            const li = document.createElement("li");
            li.innerHTML = `
<a href="https://www.youtube.com/watch?v=${id}" target="_blank">${titulo}</a> — ${canal}<br>
📝 Descripción real: ${descripcion}<br>
🔥 Hashtags SEO: ${hashtags}<br>
🏷️ Etiquetas SEO: ${etiquetas}
            `;
            lista.appendChild(li);
        });

    } catch(e){
        lista.innerHTML = `<li style="color:red;">❌ Error al cargar tendencias: ${e.message}</li>`;
    }
}

// Ejecutar al cargar y cambiar país
document.addEventListener("DOMContentLoaded", ()=>{
    const sel = document.getElementById("pais");
    obtenerTendencias(sel.value);
    sel.addEventListener("change", ()=>obtenerTendencias(sel.value));
});

// Generador manual SEO real
function generarSEO(){
    const titulo = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    if(!titulo || !descripcion) return alert("Por favor llena ambos campos");
    const NICHO_KEYWORDS = ["catalogo","cosmeticos","calzado","ventas","ofertas","productos","tendencias","moda","emprendedoras"];

    const hashtags = generarHashtags(titulo, descripcion, NICHO_KEYWORDS);
    const etiquetas = generarEtiquetas(titulo, descripcion, "Tu Canal", NICHO_KEYWORDS);

    document.getElementById("resultado").textContent = `
📢 TÍTULO SUGERIDO:
${titulo} ${AÑO}

📝 DESCRIPCIÓN:
${descripcion}

🔥 HASHTAGS SEO:
${hashtags.join(" ")}

🏷️ ETIQUETAS SEO:
${etiquetas}
    `;
}
