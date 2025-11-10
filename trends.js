// trends.js - versión estable reparada (sin romper tu conexión original)
const API_KEY = 'AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw';
const YT_BASE = 'https://www.googleapis.com/youtube/v3';

// CORS proxy opcional (solo si lo usas local y da error sin conexión)
const USE_PROXY = false;
const PROXY = 'https://api.codetabs.com/v1/proxy/?quest=';

// Helpers DOM
const $ = id => document.getElementById(id);
const safe = t => (t ? String(t) : '');
const setStatus = msg => { if ($('status')) $('status').textContent = '⏳ ' + msg; };
const showError = msg => { const e=$('err'); if(e){ e.style.display='block'; e.textContent=msg; }};
const clearError = ()=>{ const e=$('err'); if(e){ e.style.display='none'; e.textContent=''; }};
const loader = $('loader');

// Normalizar texto
function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^\w\s#-]/g,'').trim();
}
function makeHash(text){
  const t = text.replace(/^#/, '').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\s]/gi,'').trim().replace(/\s+/g,'');
  return t ? '#' + t : '';
}

// Fetch con soporte a proxy
async function fetchJson(url) {
  const finalUrl = USE_PROXY ? PROXY + encodeURIComponent(url) : url;
  const r = await fetch(finalUrl);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// Buscar videos
async function searchVideos(query, region='MX') {
  const url = `${YT_BASE}/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&regionCode=${region}&key=${API_KEY}`;
  return fetchJson(url);
}

async function getVideoDetails(ids) {
  if (!ids) return {items:[]};
  const url = `${YT_BASE}/videos?part=snippet,statistics&id=${ids}&key=${API_KEY}`;
  return fetchJson(url);
}

// Extraer hashtags + hora
function extractTags(videos){
  const tags=[], hours=[];
  for(const v of videos){
    const sn = v.snippet || {};
    (sn.tags||[]).forEach(t=>tags.push(normalize(t)));
    const desc = sn.description||'';
    const found = desc.match(/#[A-Za-z0-9_áéíóúñ]+/g)||[];
    found.forEach(h=>tags.push(normalize(h)));
    if(sn.publishedAt){
      const hmx = (new Date(sn.publishedAt).getUTCHours() -6 +24)%24;
      hours.push(hmx);
    }
  }
  return {tags,hours};
}
function freqSort(arr){
  const map={}; arr.forEach(x=>{if(x) map[x]=(map[x]||0)+1});
  return Object.keys(map).sort((a,b)=>map[b]-map[a]);
}

// Hashtags base por marca
const brandExtra = {
  arabela: ['#arabelamexico','#catalogosarabela','#perfumesarabela'],
  fuller: ['#fuller2025','#catalogofuller','#fullerlatam'],
  avon: ['#avonmexico','#catalogoavon','#avonofertas'],
  yanbal: ['#yanbal2025','#catalogoyanbal','#yanbalmexico'],
  natura: ['#naturamexico','#catalogonatura','#bellezanatura'],
  cklass: ['#cklass2025','#modacklass','#catalogoscklass'],
  price: ['#priceshoes','#calzadomoda','#catalogopriceshoes']
};

// Generar sugerencias SEO
function generarSugerencias({brand,campaign,summary,country,topTags,topHours}){
  const y = new Date().getFullYear();
  const brandLow = brand.toLowerCase();
  const hashtags = ['#vendemasporcatalogo','#catalogosvirtualeslatam'];

  (brandExtra[brandLow]||[]).forEach(h=>hashtags.push(h));
  topTags.slice(0,5).forEach(t=>{
    const h = makeHash(t);
    if(!hashtags.includes(h) && h.length>2) hashtags.push(h);
  });

  const etiquetas = [brand,`${brand} ${y}`,`${brand} ${campaign}`].concat(topTags.slice(0,10));

  const title1 = `${brand} ${campaign} ${y} | Ofertas y Novedades`;
  const title2 = `${brand} ${campaign} — Catálogo ${y} (Lo más nuevo)`;

  const desc = `${summary}\n\nDescubre las mejores ofertas y lanzamientos de ${brand} en su catálogo ${campaign} ${y}. Ideal para vendedoras, clientas y amantes de la belleza y moda en ${country}.`;

  const hours = topHours.slice(0,3).map(h=>`${h}:00-${(h+1)%24}:00`);

  return {title1,title2,desc,hashtags,etiquetas,hours};
}

// Render resultados
function mostrarResultado(s){
  $('resultado').textContent = `
📢 TÍTULO SUGERIDO:
${s.title1}

📝 DESCRIPCIÓN SUGERIDA:
${s.desc}

🔥 HASHTAGS:
${s.hashtags.join(' ')}

🏷️ ETIQUETAS (YouTube Studio):
${s.etiquetas.join(', ')}

⏰ MEJORES HORARIOS (MX):
${s.hours.join(', ')}

💡 Alternativa de título:
${s.title2}
  `.trim();
}

function mostrarTendencias(list){
  const ul=$('tendencias');
  ul.innerHTML='';
  if(!list.length){ ul.innerHTML='<li>No hay tendencias</li>'; return; }
  list.forEach(t=>{
    const li=document.createElement('li');
    li.textContent=t;
    ul.appendChild(li);
  });
}

async function runGenerator({brand,summary}){
  clearError(); setStatus('Buscando en YouTube...'); loader.style.display='block';
  try{
    const search = await searchVideos(`${brand} catálogo 2025`, 'MX');
    const ids = (search.items||[]).map(i=>i.id.videoId).filter(Boolean).join(',');
    const details = await getVideoDetails(ids);
    const {tags,hours}=extractTags(details.items);
    const sortedTags=freqSort(tags);
    const sortedHours=freqSort(hours);

    const suger = generarSugerencias({
      brand,campaign:'Campaña',summary,country:'MX',
      topTags:sortedTags,topHours:sortedHours
    });

    mostrarResultado(suger);
    mostrarTendencias((search.items||[]).map(v=>v.snippet.title));
    setStatus('✅ Listo');
  }catch(err){
    console.error(err);
    showError('Error al conectar con la API. Usando valores locales.');
    const suger = generarSugerencias({
      brand,campaign:'Campaña',summary,country:'MX',
      topTags:[],topHours:[19,20,21]
    });
    mostrarResultado(suger);
  }finally{
    loader.style.display='none';
  }
}

// Evento UI
document.addEventListener('DOMContentLoaded',()=>{
  $('generarBtn').addEventListener('click',()=>{
    const brand=$('titulo').value.trim();
    const desc=$('descripcion').value.trim();
    if(!brand||!desc){ alert('Por favor llena los campos'); return; }
    runGenerator({brand,summary:desc});
  });
});
