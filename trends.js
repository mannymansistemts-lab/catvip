const API_KEY = 'AIzaSyDlYWhDkEPsAIjedRk5Hnxs0bfAA7950EI';
const YT_BASE = 'https://www.googleapis.com/youtube/v3';
const MAX_RESULTS = 10;
const NICHO_KEYWORDS = ["catalogo","cosmeticos","calzado","ventas","ofertas","productos","tendencias","moda","emprendedoras"];
const lista = document.getElementById('tendencias');
const resultado = document.getElementById('resultado');
const año = new Date().getFullYear();

function extraerPalabras(texto){
  return texto.toLowerCase().replace(/[^a-z0-9\s]/gi,"").split(/\s+/)
    .filter(w=> w.length>2 && NICHO_KEYWORDS.some(k=>w.includes(k)));
}

function generarHashtags(titulo, descripcion){
  const palabras = extraerPalabras(titulo+" "+descripcion);
  const hashtags = [];
  for(let i=0;i<palabras.length && hashtags.length<5;i++){
    hashtags.push("#"+palabras[i].charAt(0).toUpperCase()+palabras[i].slice(1)+año);
  }
  return hashtags;
}

function generarEtiquetas(titulo, descripcion, canal){
  const palabras = extraerPalabras(titulo+" "+descripcion);
  const etiquetas = [titulo, `${titulo} ${año}`, canal, ...palabras];
  return [...new Set(etiquetas)].join(", ");
}

async function buscarVideos(query){
  lista.innerHTML="<li>Cargando resultados...</li>";
  resultado.textContent="";
  try{
    const url = `${YT_BASE}/search?part=snippet&type=video&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(query)}&relevanceLanguage=es&key=${API_KEY}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    if(!data.items || data.items.length===0){
      lista.innerHTML="<li>No se encontraron resultados.</li>";
      return;
    }

    lista.innerHTML="";
    data.items.forEach(item=>{
      if(!item.id.videoId) return;
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

    const first = data.items.find(v=>v.id.videoId);
    if(first){
      const t = first.snippet.title;
      const d = first.snippet.description;
      const c = first.snippet.channelTitle;
      resultado.textContent = `
📢 TÍTULO OPTIMIZADO:
${t} ${año}

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

document.getElementById('btnSearch').addEventListener('click',()=>{
  const query = document.getElementById('inputQuery').value.trim();
  if(!query) return alert("Escribe un término de búsqueda");
  buscarVideos(query);
});

// Inicialización
document.addEventListener('DOMContentLoaded', ()=>{
  lista.innerHTML="<li>Listo para buscar.</li>";
});
