// trends.js - Generador simplificado para YouTube (catálogos, cosméticos y calzado)
const API_KEY = 'AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw';
const YT_BASE = 'https://www.googleapis.com/youtube/v3';

const $ = id => document.getElementById(id);

function normalizeToken(s) {
  return s.toString()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^\w\s#-]/g, '')
    .trim();
}

function makeHash(text) {
  if (!text) return '';
  const t = text.replace(/^#/, '').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\s]/gi,'').trim().replace(/\s+/g,'');
  return t ? '#' + t : '';
}

function showError(msg){const e=$('err');if(e){e.style.display='block';e.textContent=msg;}console.error(msg);}
function clearError(){const e=$('err');if(e){e.style.display='none';e.textContent='';}}

async function fetchJson(url){
  const r = await fetch(url, { mode:'cors', referrerPolicy:'no-referrer' });
  if(!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
}

async function searchVideos(query, maxResults=12){
  const q = encodeURIComponent(query);
  const url = `${YT_BASE}/search?part=snippet&type=video&maxResults=${maxResults}&q=${q}&relevanceLanguage=es&key=${API_KEY}`;
  return fetchJson(url);
}

async function getVideosDetails(idsCsv){
  if(!idsCsv) return {items:[]};
  const url = `${YT_BASE}/videos?part=snippet,statistics&id=${idsCsv}&key=${API_KEY}`;
  return fetchJson(url);
}

function extractTags(videoItems){
  const tags = [];
  for(const v of videoItems||[]){
    const sn = v.snippet || {};
    (sn.tags||[]).forEach(t => tags.push(normalizeToken(t)));
    const desc = sn.description || '';
    try {
      const found = desc.match(/#[\p{L}\p{N}_]+/gu) || [];
      found.forEach(h => tags.push(normalizeToken(h)));
    } catch(e){
      const found2 = desc.match(/#[A-Za-z0-9_]+/g) || [];
      found2.forEach(h => tags.push(normalizeToken(h)));
    }
  }
  return tags;
}

function freqSorted(arr){
  const map = {};
  arr.forEach(x=>{if(x) map[x]=(map[x]||0)+1;});
  return Object.keys(map).sort((a,b)=> map[b]-map[a]);
}

function generateSuggestions({brand, summary, topTokens}){
  const year = (new Date()).getFullYear();
  const title = `${brand} | Catálogo ${year} - Ofertas y novedades`;
  const description = `${summary ? summary + '\n\n' : ''}Descubre los mejores productos de ${brand} en este catálogo actualizado. Ideal para clientes y vendedoras de cosméticos, moda y calzado.`;
  
  const fixedHashes = ['#catalogosdigitales','#modaybelleza'];
  const hashtags = [];
  for(const h of topTokens){
    if(hashtags.length>=5) break;
    const hh = h.startsWith('#') ? h : makeHash(h);
    if(hh.length>1 && !hashtags.includes(hh)) hashtags.push(hh);
  }
  const finalHashtags = [...fixedHashes, ...hashtags].slice(0,7);

  const tagsSEO = topTokens.slice(0,12).map(t=>t.replace(/^#/,''));

  return {title, description, hashtags: finalHashtags, tags: tagsSEO};
}

async function runGenerator({brand, summary}){
  clearError();
  try{
    const query = `${brand} catalogo cosmeticos calzado`;
    const searchJson = await searchVideos(query);
    let items = (searchJson.items||[]).filter(v=>{
      const txt = `${v.snippet?.title||''} ${v.snippet?.description||''}`.toLowerCase();
      return /(catalogo|cosmetico|cosmético|belleza|zapato|calzado|moda|fragancia|perfume)/.test(txt);
    });

    const ids = items.map(i=>i.id?.videoId||i.id).filter(Boolean).join(',');
    const details = await getVideosDetails(ids);
    const videoItems = details.items || [];

    const rawTokens = extractTags(videoItems);
    const sortedTokens = freqSorted(rawTokens);

    const suggestions = generateSuggestions({brand, summary, topTokens: sortedTokens});

    const out = $('resultado');
    if(out){
      out.textContent = `
📢 TITULO SUGERIDO:
${suggestions.title}

📝 DESCRIPCIÓN SUGERIDA:
${suggestions.description}

🔥 HASHTAGS:
${suggestions.hashtags.join(' ')}

🏷️ ETIQUETAS SEO:
${suggestions.tags.join(', ')}
      `.trim();
    }

  }catch(err){
    showError('Error al generar sugerencias: ' + (err.message||err));
  }
}

function initUI(){
  const btn = $('generarBtn');
  if(btn){
    btn.addEventListener('click', async ()=>{
      const brand = $('titulo')?.value.trim() || '';
      const summary = $('descripcion')?.value.trim() || '';
      await runGenerator({brand, summary});
    });
  }else{
    window.generarSEO = async ()=>{
      const brand = $('titulo')?.value.trim() || '';
      const summary = $('descripcion')?.value.trim() || '';
      await runGenerator({brand, summary});
    };
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  if(!API_KEY || API_KEY==='YOUR_API_KEY_HERE'){
    showError('API key no configurada.');
  }else{
    initUI();
  }
});
