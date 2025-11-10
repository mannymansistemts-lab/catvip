// trends.js - versión optimizada para catálogos, cosméticos y calzado
const API_KEY = 'AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw';
const YT_BASE = 'https://www.googleapis.com/youtube/v3';

const MAX_SEARCH = 12;
const MAX_VIDEO_DETAILS = 12;

const $ = id => document.getElementById(id);
const safeText = t => (t == null ? '' : String(t));

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

function extractTagsAndHours(videoItems){
  const tags=[],publishedHours=[];
  for(const v of videoItems||[]){
    const sn=v.snippet||{};
    (sn.tags||[]).forEach(t=>tags.push(normalizeToken(t)));
    const desc=sn.description||'';
    try{
      const found=desc.match(/#[\p{L}\p{N}_]+/gu)||[];
      found.forEach(h=>tags.push(normalizeToken(h)));
    }catch(e){
      const found2=desc.match(/#[A-Za-z0-9_]+/g)||[];
      found2.forEach(h=>tags.push(normalizeToken(h)));
    }
    if(sn.publishedAt){
      const date=new Date(sn.publishedAt);
      const hourMX=(date.getUTCHours()-6+24)%24;
      publishedHours.push(hourMX);
    }
  }
  return{tags,publishedHours};
}

function freqSorted(arr){
  const map={};
  arr.forEach(x=>{if(x)map[x]=(map[x]||0)+1;});
  return Object.keys(map).sort((a,b)=>map[b]-map[a]);
}

function generateSuggestions({brand,campaign,summary,country,topTokens,topHours}){
  const year=(new Date()).getFullYear();
  const brandClean=brand||'Marca';
  const campaignClean=campaign||'';
  const title1=`${brandClean} ${campaignClean} ${year} | Ofertas y Novedades`;
  const title2=`${brandClean} ${campaignClean} — Catálogo ${year} (Lo más nuevo)`;
  const desc=`${summary?summary+'\n\n':''}Descubre las mejores ofertas y lanzamientos de ${brandClean} en este catálogo ${campaignClean} ${year}. Ideal para vendedoras y clientes en ${country||'LATAM'}.`;
  const resultHashes=[];
  const fixedA='#catalogosdigitales',fixedB='#modaybelleza';
  resultHashes.push(fixedA,fixedB);
  const maxPer=7;
  for(const t of topTokens){
    if(resultHashes.length>=maxPer)break;
    const h=t.startsWith('#')?t:makeHash(t);
    if(!resultHashes.includes(h)&&h.length>1)resultHashes.push(h);
  }
  const basics=[makeHash(`catalogo ${brandClean}`),makeHash(`${brandClean} ${year}`),makeHash(`${brandClean} mexico`)];
  for(const b of basics){if(resultHashes.length<maxPer&&b&&!resultHashes.includes(b))resultHashes.push(b);}
  const studioTags=[];
  studioTags.push(`${brandClean} ${campaignClean}`.trim());
  studioTags.push(`${brandClean} ${year}`.trim());
  topTokens.slice(0,12).forEach(t=>{
    const tClean=t.replace(/^#/,'');
    if(tClean&&!studioTags.includes(tClean))studioTags.push(tClean);
  });
  const bestHours=(topHours||[]).slice(0,3).map(h=>Number(h));
  return{titles:[title1,title2],description:desc,hashtags:resultHashes,tags:studioTags,bestHours};
}

function renderTendencias(list){
  const ul=$('tendencias');
  if(!ul)return;
  ul.innerHTML='';
  if(!list||!list.length){ul.innerHTML='<li>No hay tendencias</li>';return;}
  for(const t of list.slice(0,12)){
    const li=document.createElement('li');
    li.textContent=safeText(t);
    ul.appendChild(li);
  }
}

function renderResultado(sugg){
  const out=$('resultado');
  if(!out)return;
  const title=sugg.titles?.[0]||'';
  const title2=sugg.titles?.[1]||'';
  const desc=sugg.description||'';
  const hashtags=(sugg.hashtags||[]).join(' ');
  const tags=(sugg.tags||[]).join(', ');
  const hours=(sugg.bestHours||[]).map(h=>`${h}:00-${(h+1)%24}:00`).join(', ');
  out.textContent=`
📢 TITULO SUGERIDO:
${title}

📝 DESCRIPCIÓN SUGERIDA:
${desc}

🔥 HASHTAGS:
${hashtags}

🏷️ ETIQUETAS (YouTube Studio):
${tags}

⏰ MEJORES HORARIOS (MX):
${hours}

💡 Alternativa de título:
${title2}
  `.trim();
}

// FILTRO DE NICHO: solo videos relacionados con catálogos, cosméticos o calzado
function esVideoDeNicho(video){
  const texto = `${video?.snippet?.title || ''} ${video?.snippet?.description || ''}`.toLowerCase();
  return /(catalogo|catálogo|cosmetico|cosmético|belleza|zapato|calzado|moda|fragancia|perfume)/.test(texto);
}

async function runGenerator({brand,campaign,summary,country='MX'}){
  clearError();
  setStatus('buscando en YouTube...');
  try{
    const q=`${brand} ${campaign}`.trim()||'catalogos cosmeticos calzado';
    let searchJson=await searchVideos(q,country,MAX_SEARCH).catch(()=>null);
    let items=(searchJson&&searchJson.items)?searchJson.items:[];
    
    // FILTRO
    items = items.filter(esVideoDeNicho);
    
    if(!items.length){
      setStatus('sin resultados, buscando populares del nicho...');
      const pop=await fetchJson(`${YT_BASE}/videos?part=snippet&chart=mostPopular&regionCode=${country}&maxResults=${MAX_VIDEO_DETAILS}&key=${API_KEY}`);
      items=(pop.items||[]).filter(esVideoDeNicho);
    }

    const trendTitles=(items||[]).map(it=>it.snippet?.title||'Video');
    renderTendencias(trendTitles);

    const ids=items.map(i=>i.id?.videoId||i.id).filter(Boolean).join(',');
    const details=await getVideosDetails(ids);
    const videoItems=details.items||[];

    const {tags:rawTags,publishedHours}=extractTagsAndHours(videoItems);
    const sortedTokens=freqSorted(rawTags);
    const suggestions=generateSuggestions({brand,campaign,summary,country,topTokens:sortedTokens,topHours:freqSorted(publishedHours)});
    renderResultado(suggestions);
    setStatus('listo');
    return suggestions;
  }catch(err){
    setStatus('error');
    showError('Error al generar sugerencias: '+(err.message||err));
    const fallback=generateSuggestions({brand,campaign,summary,country,topTokens:[],topHours:[19,20]});
    renderResultado(fallback);
    return fallback;
  }
}

function initUI(){
  const btn=$('generarBtn');
  if(btn){
    btn.addEventListener('click',async()=>{
      const brand=$('titulo')?.value.trim()||'';
      const summary=$('descripcion')?.value.trim()||'';
      await runGenerator({brand,campaign:'',summary,country:'MX'});
    });
  }else{
    window.generarSEO=async function(){
      const brand=$('titulo')?.value.trim()||'';
      const summary=$('descripcion')?.value.trim()||'';
      await runGenerator({brand,campaign:'',summary,country:'MX'});
    };
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  if(!API_KEY||API_KEY==='YOUR_API_KEY_HERE'){
    showError('API key no configurada.');
  }else{
    clearError();
    runGenerator({brand:'',campaign:'',summary:'',country:'MX'}).catch(console.warn);
  }
  initUI();
});
