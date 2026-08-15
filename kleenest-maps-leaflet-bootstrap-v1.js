/* Maps Leaflet bootstrap v1: make map-engine loading resilient before the canonical Maps surface mounts. */
(function(g){'use strict';
if(g.__KLEENEST_MAPS_LEAFLET_BOOTSTRAP_V1__)return;
g.__KLEENEST_MAPS_LEAFLET_BOOTSTRAP_V1__=true;
const sources=[
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'
];
const cssSources=[
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css'
];
function loadCss(){
  if(document.getElementById('kleenest-leaflet-css-v1'))return;
  const l=document.createElement('link');l.id='kleenest-leaflet-css-v1';l.rel='stylesheet';l.href=cssSources[0];document.head.appendChild(l);
}
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=resolve;s.onerror=()=>reject(Error('Leaflet failed to load from '+src));document.head.appendChild(s)})}
async function ensure(){
  loadCss();
  if(g.L)return true;
  for(const src of sources){
    try{await loadScript(src);if(g.L)return true}catch(e){console.warn('[Kleenest Maps] Leaflet source failed',e)}
  }
  return false;
}
g.KleenestMapsLeafletBootstrap={ensure};
ensure().catch(e=>console.warn('[Kleenest Maps] Leaflet bootstrap failed',e));
})(window);
