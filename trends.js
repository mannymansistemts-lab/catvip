const API_KEY = "AIzaSyDlYWhDkEPsAIjedRk5Hnxs0bfAA7950EI";
const YT_BASE = "https://www.googleapis.com/youtube/v3";
const lista = document.getElementById("tendencias");
const resultado = document.getElementById("resultado");
const AÑO = new Date().getFullYear();
const NICHO_KEYWORDS = ["catalogo","cosmeticos","calzado","ventas","ofertas","productos","tendencias","moda","emprendedoras"];

function extraerPalabras(texto){
    return texto.toLowerCase().replace(/[^a-z0-9\s]/gi,"").split(/\s+/)
        .filter(w=>w.length>2 && NICHO_KEYWORDS.some(k=>w.includes(k)));
}

function generarHashtags(titulo, descripcion){
    const palabras = extraerPalabras(titulo+" "+descripcion);
    const hashtags = [];
    for(let i=0;i<palabras.length && hashtags.length<5;i++){
        hashtags.push("#"+palabras[i].charAt(0).toUpperCase()+palabras[i].slice(1)+AÑO);
    }
    return hashtags;
}

function generarEtiquetas(titulo, descripcion, canal){
    const palabras = extraerPalabras(titulo+" "+descripcion);
    const etiquetas = [titulo, `${titulo} ${AÑO}`, canal, ...palabras];
    return [...new Set(etiquetas)].join(", ");
}

async function buscarVideos(query){
    lista.innerHTML="<li>Cargando resultados...</li>";
    try{
        const url = `${YT_BASE}/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&relevanceLanguage=es&key=${API_KEY}`;
        const res = await fetch(url);
        if(!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        if(!data.items || data.items.length===0){
            lista.innerHTML="<li>No se encontraron resultados.</li>";
            resultado.textContent="";
            return;
        }

        lista.innerHTML="";
        data.items.forEach(item=>{
            if(!item.id.videoId) return; // ignorar canales o playlists
            const id = item.id.videoId;
            const titulo = item.snippet.title;
            const descripcionText = item.snippet.description;
            const canal = item.snippet.channelTitle;

            const hashtags = generarHashtags(titulo, descripcionText).join(" ");
            const etiquetas = generarEtiquetas(titulo, descripcionText, canal);

            const li = document.createElement("li");
            li.innerHTML = `
<a href="https://www.youtube.com/watch?v=${id}" target="_blank">${titulo}</a> — ${canal}<br>
📝 Descripción: ${descripcionText}<br>
🔥 Hashtags SEO: ${hashtags}<br>
🏷️ Etiquetas SEO: ${etiquetas}
            `;
            lista.appendChild(li);
        });

        // Mostrar primer resultado en el generador
        const first = data.items.find(v=>v.id.videoId);
        if(first){
            const t = first.snippet.title;
            const d = first.snippet.description;
            const c = first.snippet.channelTitle;
            resultado.textContent = `
📢 TÍTULO OPTIMIZADO:
${t} ${AÑO}

📝 DESCRIPCIÓN:
${d}

🔥 HASHTAGS SEO:
${generarHashtags(t,d).join(" ")}

🏷️ ETIQUETAS SEO:
${generarEtiquetas(t,d,c)}
            `;
        }

    }catch(e){
        lista.innerHTML=`<li style="color:red;">❌ Error al cargar resultados: ${e.message}</li>`;
        resultado.textContent="";
    }
}

// Botón
document.getElementById("btnSearch").addEventListener("click",()=>{
    const q = document.getElementById("inputQuery").value.trim();
    if(!q) return alert("Escribe un término de búsqueda");
    buscarVideos(q);
});
