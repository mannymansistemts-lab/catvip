const API_KEY = "AIzaSyDlYWhDkEPsAIjedRk5Hnxs0bfAA7950EI"; // Tu API key activa
const YT_BASE = "https://www.googleapis.com/youtube/v3";
const lista = document.getElementById("tendencias");

// Palabras clave de tu nicho
const NICHO_KEYWORDS = ["catalogo","cosmeticos","calzado","ventas","ofertas","productos","tendencias","moda","emprendedoras"];
const AÑO = new Date().getFullYear();

// Función para generar hashtags SEO (5 máximos) a partir de título y nicho
function generarHashtagsSEO(titulo) {
    // Limpiar título y dividir en palabras
    let palabras = titulo.toLowerCase().replace(/[^a-z0-9\s]/gi,"").split(" ");
    palabras = palabras.filter(w => w.length>2 && NICHO_KEYWORDS.includes(w) || NICHO_KEYWORDS.some(k => w.includes(k)));
    
    const hashtags = [];
    // Agregar palabras del título
    for(let w of palabras){
        if(!hashtags.includes("#"+w)) hashtags.push("#"+w);
        if(hashtags.length>=5) break;
    }
    // Completar hasta 5 con palabras clave del nicho
    for(let k of NICHO_KEYWORDS){
        if(hashtags.length>=5) break;
        if(!hashtags.includes("#"+k)) hashtags.push("#"+k);
    }
    // Agregar año en uno de los hashtags
    hashtags[0] = hashtags[0]+AÑO;
    return hashtags;
}

// Función para generar etiquetas SEO long-tail
function generarEtiquetasSEO(titulo, canal) {
    const etiquetas = [
        titulo.toLowerCase(),
        `${titulo.toLowerCase()} ${AÑO}`,
        `${titulo.toLowerCase()} catálogo`,
        canal.toLowerCase(),
        "tendencias youtube",
        "videos populares",
        "ventas por catálogo",
        "productos de belleza",
        "calzado y moda"
    ];
    return etiquetas.join(", ");
}

// Función para obtener tendencias
async function obtenerTendencias(region="MX") {
    lista.innerHTML = "<li>Cargando tendencias...</li>";
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
        data.items.forEach(v=>{
            const titulo = v.snippet.title;
            const canal = v.snippet.channelTitle;
            const id = v.id;

            const hashtagsSEO = generarHashtagsSEO(titulo).join(" ");
            const etiquetasSEO = generarEtiquetasSEO(titulo, canal);

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
document.addEventListener("DOMContentLoaded", ()=>{
    const sel = document.getElementById("pais");
    obtenerTendencias(sel.value);
    sel.addEventListener("change", ()=>obtenerTendencias(sel.value));
});

// Función SEO para formulario manual
function generarSEO(){
    const titulo = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    if(!titulo || !descripcion) return alert("Por favor llena ambos campos");

    const hashtags = generarHashtagsSEO(titulo);
    const etiquetas = generarEtiquetasSEO(titulo,"Tu Canal");

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
