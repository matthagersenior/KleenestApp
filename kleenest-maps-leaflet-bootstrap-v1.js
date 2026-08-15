/* Maps Leaflet bootstrap v3: resilient, awaitable, single-flight map-engine loading. */
(function(g){'use strict';
if(g.__KLEENEST_MAPS_LEAFLET_BOOTSTRAP_V3__)return;
g.__KLEENEST_MAPS_LEAFLET_BOOTSTRAP_V3__=true;
const sources=['https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'];
const cssSources=['https://unpkg.com/leaflet@1.9.4/dist/leaflet.css','https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css'];
let pending=null;
function loadCss(){if(document.getElementById('kleenest-leaflet-css-v3'))return;const l=document.createElement('link');l.id='kleenest-leaflet-css-v3';l.rel='stylesheet';l.href=cssSources[0];l.onerror=()=>{l.href=cssSources[1]};document.head.appendChild(l)}
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(Error('Leaflet failed to load from '+src));document.head.appendChild(s)})}
function ensure(){if(g.L)return Promise.resolve(true);if(pending)return pending;loadCss();pending=(async()=>{for(const src of sources){try{await loadScript(src);if(g.L)return true}catch(e){console.warn('[Kleenest Maps] Leaflet source failed',e)}}return false})().finally(()=>{pending=null});return pending}
g.KleenestMapsLeafletBootstrap={ensure};
})(window);
