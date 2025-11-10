const API_KEY = "AIzaSyDlYWhDkEPsAIjedRk5Hnxs0bfAA7950EI"; // tu API key activa de YouTube
const YT_BASE = "https://www.googleapis.com/youtube/v3";
const lista = document.getElementById("tendencias");
const AÑO = new Date().getFullYear();

// Palabras clave de tu nicho
const NICHO_KEYWORDS = ["catalogo","cosmeticos","calzado","ventas","ofertas","productos","tendencias","moda","emprendedoras"];

// Limpiar y extraer palabras relevantes
function extraerPalabras(texto) {
    return texto.toLowerCase().replace(/[^a-z0-9\s]/gi,"").split(/\s+/)
        .filter(w=> w.length>2 && NICHO_KEYWORDS.some(k=> w.includes(k)));
}

// Generar hashtags SEO 100% reales
function generarHashtags(titulo, descripcion) {
    const palabras = extraerPalabras(titulo+" "+descripcion);
    const hashtags = [];
    for(let i=0;i<palabras.length && hashtags.length<5;i++){
        hashtags.push("#"+palabras[i].charAt(0).toUpperCase()+palabras[i].slice(1)+AÑO);
    }
    return hashtags;
}

// Generar etiquetas long-tail SEO
function generarEtiquetas(titulo, descripcion, canal){
    const palabras = extraerPalabras(titulo+" "+descripcion);
    const etiquetas = [titulo, `${titulo} ${AÑO}`, canal, ...palabras];
    return [...new Set(etiquetas)].join(", ");
}

// Buscar videos por término de búsqueda
async function buscarVideos(query){
    lista.innerHTML="<li>Cargando resultados...</li>";
    try{
        const url = `${YT_BASE}/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&relevanceLanguage=es&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if(!res.ok) throw new Error(data.error?.message || "Error desconocido");
        if(!data.items || data.items.length===0){
            lista.innerHTML="<li>No se encontraron resultados.</li>";
            return;
        }
        lista.innerHTML="";
        data.items.forEach(video=>{
            const titulo = video.snippet.title;
            const descripcion = video.snippet.description;
            const canal = video.snippet.channelTitle;
            const id = video.id.videoId;

            const hashtags = generarHashtags(titulo, descripcion).join(" ");
            const etiquetas = generarEtiquetas(titulo, descripcion, canal);

            const li = document.createElement("li");
            li.innerHTML = `
<a href="https://www.youtube.com/watch?v=${id}" target="_blank">${titulo}</a> — ${canal}<br>
📝 Descripción real: ${descripcion}<br>
🔥 Hashtags SEO: ${hashtags}<br>
🏷️ Etiquetas SEO: ${etiquetas}
            `;
            lista.appendChild(li);
        });
        // Mostrar resultado del primer video en el generador manual
        const primer = data.items[0];
        if(primer){
            const t = primer.snippet.title;
            const d = primer.snippet.description;
            const h = generarHashtags(t,d).join(" ");
            const e = generarEtiquetas(t,d,primer.snippet.channelTitle);
            document.getElementById("resultado").textContent = `
📢 TÍTULO OPTIMIZADO:
${t} ${AÑO}

📝 DESCRIPCIÓN:
${d}

🔥 HASHTAGS SEO:
${h}

🏷️ ETIQUETAS SEO:
${e}
            `;
        }
    }catch(e){
        lista.innerHTML=`<li style="color:red;">❌ Error al cargar resultados: ${e.message}</li>`;
    }
}

// Botón de búsqueda
document.getElementById("btnSearch").addEventListener("click",()=>{
    const query = document.getElementById("inputQuery").value.trim();
    if(!query) return alert("Escribe un término de búsqueda");
    buscarVideos(query);
});
