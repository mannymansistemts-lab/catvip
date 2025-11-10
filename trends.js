// trends-debug.js - muestra el error real y prueba fallback con proxy opcional
const API_KEY = 'AIzaSyDAQVkMZ_l73dK7pt9gaccYPn5L0vA3PGw'; // <- pon tu API key
const YT_BASE = 'https://www.googleapis.com/youtube/v3';
const TRY_PROXY_IF_FAILS = true;   // cambia a false si no quieres usar proxy
const PROXY_PREFIX = 'https://api.codetabs.com/v1/proxy/?quest='; // proxy para pruebas

// DOM helpers (asegúrate de que tu HTML tenga ids: status, err, resultado, tendencias, loader)
const $ = id => document.getElementById(id);
const setStatus = txt => { if($('status')) $('status').textContent = txt; };
const showError = txt => { if($('err')){ $('err').style.display='block'; $('err').textContent = txt; } };
const clearError = () => { if($('err')){ $('err').style.display='none'; $('err').textContent=''; } };
const showDebug = txt => {
  const out = $('resultado');
  if(out) out.textContent = txt;
  else console.log(txt);
};

async function rawFetch(url, useProxy=false){
  const final = useProxy ? (PROXY_PREFIX + encodeURIComponent(url)) : url;
  // mostrar en consola la url real que llama (sin exponer la key en logs públicos)
  console.log('Fetch ->', useProxy ? 'via proxy' : 'direct', final);
  // No cache para evitar usar cache del navegador
  return fetch(final, { cache: 'no-store' });
}

async function fetchJsonWithDebug(url){
  try {
    const res = await rawFetch(url, false);
    // si la respuesta NO es ok intentamos leer el body y lanzarlo
    if (!res.ok) {
      let text;
      try { text = await res.text(); } catch(e){ text = `No body (${e.message})`; }
      // tratar de parsear JSON si viene así
      let parsed = text;
      try { parsed = JSON.parse(text); } catch(_) {}
      throw { status: res.status, statusText: res.statusText, body: parsed };
    }
    return await res.json();
  } catch (err) {
    // err puede ser Error o el objeto que lanzamos arriba
    throw err;
  }
}

async function fetchJsonWithProxyFallback(url){
  try {
    return await fetchJsonWithDebug(url); // intento directo
  } catch (errDirect) {
    console.warn('Direct fetch failed:', errDirect);
    // si está permitido, testear con proxy
    if (TRY_PROXY_IF_FAILS) {
      try {
        const resProxy = await rawFetch(url, true);
        if (!resProxy.ok) {
          let t;
          try { t = await resProxy.text(); } catch(e){ t = `No body (${e.message})`; }
          let parsed = t;
          try { parsed = JSON.parse(t); } catch(_) {}
          throw { status: resProxy.status, statusText: resProxy.statusText, body: parsed, proxy: true };
        }
        return await resProxy.json();
      } catch (errProxy) {
        // devolver error combinado
        throw { direct: errDirect, proxy: errProxy };
      }
    }
    throw errDirect;
  }
}

// función de búsqueda simple (como en tu original)
async function searchVideos(query, region='MX'){
  const url = `${YT_BASE}/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&regionCode=${region}&key=${API_KEY}`;
  return await fetchJsonWithProxyFallback(url);
}

async function getVideoDetails(idsCsv){
  if(!idsCsv) return { items: [] };
  const url = `${YT_BASE}/videos?part=snippet,statistics&id=${idsCsv}&key=${API_KEY}`;
  return await fetchJsonWithProxyFallback(url);
}

// Extraer y mostrar (simplificado)
function extractTags(videos){
  const tags = [];
  for(const v of videos || []){
    const sn = v.snippet || {};
    (sn.tags || []).forEach(t=>tags.push(t));
    const desc = sn.description || '';
    const found = (desc.match(/#[A-Za-z0-9_áéíóúñ]+/g) || []);
    found.forEach(h=>tags.push(h));
  }
  return tags;
}

async function runDebug(brand){
  clearError();
  setStatus('Probando conexión con YouTube API...');
  if($('loader')) $('loader').style.display = 'block';
  try {
    const q = (brand || 'catalogo') + ' catálogo 2025';
    const search = await searchVideos(q, 'MX');
    setStatus('Search OK — obteniendo detalles...');
    // obtener ids
    const ids = (search.items||[]).map(it => (it.id && it.id.videoId) ? it.id.videoId : (it.id || '')).filter(Boolean).join(',');
    const details = await getVideoDetails(ids);
    setStatus('Detalles OK — extrayendo tags...');
    const tags = extractTags(details.items);
    showDebug(`✅ Conexión correcta.\nResultados de search: ${ (search.items||[]).length } videos\nTags extraídas (primeras 30):\n${tags.slice(0,30).join(', ')}`);
    // mostrar títulos de tendencias si hay
    if($('tendencias')){
      const ul = $('tendencias'); ul.innerHTML='';
      (search.items||[]).forEach(it => {
        const title = (it.snippet && it.snippet.title) ? it.snippet.title : JSON.stringify(it);
        const li = document.createElement('li'); li.textContent = title; ul.appendChild(li);
      });
    }
    setStatus('✅ Listo — conexión exitosa');
    return { search, details };
  } catch (err) {
    console.error('ERROR detallado:', err);
    // Formatear el mensaje de error para mostrar en UI
    let msg = '❌ Error al conectar con la API.\n\n';
    if (err && err.status) {
      msg += `HTTP ${err.status} ${err.statusText || ''}\n`;
      msg += `Body: ${JSON.stringify(err.body, null, 2)}\n`;
      msg += `\nSi ves "dailyLimitExceeded" o "quotaExceeded" -> es problema de cuota.\nSi ves \"accessNotConfigured\" o \"API key not valid\" -> revisa Google Cloud.\nSi ves 403 con reason "dailyLimitExceeded" o "forbidden" -> revisa restricciones.\n`;
    } else if (err && err.direct && err.proxy) {
      msg += `Intento directo falló: ${JSON.stringify(err.direct, null, 2)}\nIntento proxy falló: ${JSON.stringify(err.proxy, null, 2)}\n`;
    } else {
      msg += (err && err.message) ? err.message : JSON.stringify(err);
    }
    showError(msg);
    setStatus('❌ Error — revisa detalles en el cuadro rojo y la consola (F12)');
    showDebug('Ver consola (F12) para más detalles.'); 
    return null;
  } finally {
    if($('loader')) $('loader').style.display = 'none';
  }
}

// Exponer funciones globales para que tu HTML pueda llamarlo
window.runTrendsDebug = runDebug;
window.searchVideos = searchVideos;
window.getVideoDetails = getVideoDetails;
