// trends.js - versión optimizada para catálogos, cosméticos y calzado
const API_KEY = 'AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw';
const YT_BASE = 'https://www.googleapis.com/youtube/v3';

const MAX_SEARCH = 12;
const MAX_VIDEO_DETAILS = 12;

const $ = id => document.getElementById(id);
const safeText = t => (t == null ? '' : String(t));

function makeHash(text){
  if(!text)return'';
  const t=text.replace(/^#/,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\s]/gi,'').trim().replace(/\s+/g,'');
  return t?'#'+t:'';
}

function setStatus(msg){const s=$('status');if(s)s.textContent='Estado: '+msg;}
function showError(msg){const e=$('err');if(e){e.style.display='block';e.textContent=msg;}console.error(msg);}
function clearError(){const e=$('err');if(e){e.style.display='none';e.textContent='';}}

async function fetchJson(url){
  const r=await fetch(url);
  if(!r.ok)throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
}

async function searchVideos(query,country='MX',maxResults=MAX_SEARCH){
  const q=encodeURIComponent(query);
  const url=`${YT_BASE}/search?part=snippet&type=video&maxResults=${maxResults}&q=${q}&relevanceLanguage=es&regionCode=${country}&key=${API_KEY}`;
  return fetchJson(url);
}

async function getVideosDetails(idsCsv){
  if(!idsCsv)return{items:[]};
  const url=`${YT_BASE}/videos?part=snippet,statistics&id=${idsCsv}&key=${API_KEY}`;
  return fetchJson(url);
}

function extractTags(videoItems){
  const tags=[];
  for(const v of videoItems||[]){
    const sn=v.snippet||{};
    (sn.tags||[]).forEach(t=>tags.push(t));
    const desc=sn.description||'';
    const found=desc.match(/#[\w]+/g)||[];
    found.forEach(h=>tags.push(h));
  }
  return tags;
}

function freqSorted(arr){
  const map={};
  arr.forEach(x=>{if(x)map[x]=(map[x]||0)+1;});
  return Object.keys(map).sort((a,b)=>map[b]-map[a]);
}

function generateSuggestions({brand,summary,topTokens}){
  const year=new Date().getFullYear();
  const title=`${brand} ${year} | Ofertas y Novedades`;
  const description=`${summary?summary+'\n\n':''}Descubre las mejores ofertas y lanzamientos de ${brand} ${year}. Catálogos de cosméticos, calzado y moda.`;
  const hashtags=['#catalogosdigitales','#modaybelleza'];
  for(const t of topTokens){
    if(hashtags.length>=7)break;
    const h=t.startsWith('#')?t:makeHash(t);
    if(!hashtags.includes(h))hashtags.push(h);
  }
  const seoTags=topTokens.slice(0,12).map(t=>t.replace(/^#/,''));
  return {title,description,hashtags,seoTags};
}

function renderResultado(sugg){
  const out=$('resultado');
  if(!out)return;
  out.textContent=`
📢 TITULO SUGERIDO:
${sugg.title}

📝 DESCRIPCIÓN SUGERIDA:
${sugg.description}

🔥 HASHTAGS:
${sugg.hashtags.join(' ')}

🏷️ ETIQUETAS SEO:
${sugg.seoTags.join(', ')}
  `.trim();
}

function esVideoDeNicho(video){
  const texto=`${video?.snippet?.title||''} ${video?.snippet?.description||''}`.toLowerCase();
  return /(catalogo|catálogo|cosmetico|cosmético|belleza|zapato|calzado|moda|fragancia|perfume)/.test(texto);
}

async function runGenerator({brand,summary}){
  clearError();
  setStatus('buscando en YouTube...');
  try{
    const q=brand?`${brand} catalogos cosmeticos calzado`:'catalogos cosmeticos calzado';
    let searchJson=await searchVideos(q);
    let items=(searchJson?.items||[]).filter(esVideoDeNicho);
    
    if(!items.length){
      setStatus('sin resultados, obteniendo populares del nicho...');
      const pop=await fetchJson(`${YT_BASE}/videos?part=snippet&chart=mostPopular&regionCode=MX&maxResults=${MAX_VIDEO_DETAILS}&key=${API_KEY}`);
      items=(pop.items||[]).filter(esVideoDeNicho);
    }

    const ids=items.map(i=>i.id?.videoId||i.id).filter(Boolean).join(',');
    const details=await getVideosDetails(ids);
    const videoItems=details.items||[];
    const topTokens=freqSorted(extractTags(videoItems));
    const suggestions=generateSuggestions({brand,summary,topTokens});
    renderResultado(suggestions);
    setStatus('listo');
  }catch(err){
    setStatus('error');
    showError('Error: '+err.message);
  }
}

function initUI(){
  const btn=$('generarBtn');
  if(btn){
    btn.addEventListener('click',()=>{ 
      const brand=$('titulo')?.value||'';
      const summary=$('descripcion')?.value||'';
      runGenerator({brand,summary});
    });
  }else{
    window.generarSEO=()=>{ 
      const brand=$('titulo')?.value||'';
      const summary=$('descripcion')?.value||'';
      runGenerator({brand,summary});
    };
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  if(!API_KEY){
    showError('API Key no configurada');
    return;
  }
  initUI();
});
