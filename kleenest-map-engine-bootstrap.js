/* Maps engine bootstrap v1: make Leaflet loading resilient before any Maps surface mounts. */
(function(g){'use strict';
if(g.__KLEENEST_MAP_ENGINE_BOOTSTRAP_V1__)return;
g.__KLEENEST_MAP_ENGINE_BOOTSTRAP_V1__=true;
const CSS='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
const JS=['https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];
function css(){if(document.getElementById('kleenest-leaflet-css'))return;const l=document.createElement('link');l.id='kleenest-leaflet-css';l.rel='stylesheet';l.href=CSS;document.head.appendChild(l)}
function load(src){return new Promise((resolve,reject)=>{const existing=[...document.scripts].find(s=>s.src===src);if(existing){if(g.L)return resolve();existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(Error('Leaflet failed to load from '+src)),{once:true});return}const s=document.createElement('script');s.src=src;s.async=false;s.onload=()=>g.L?resolve():reject(Error('Leaflet script loaded without L'));s.onerror=()=>reject(Error('Leaflet failed to load from '+src));document.head.appendChild(s)})}
async function ensure(){css();if(g.L)return g.L;let last=null;for(const src of JS){try{await load(src);if(g.L)return g.L}catch(e){last=e}}throw last||Error('Leaflet unavailable')}
g.KleenestMapEngine={ensure,version:'leaflet-bootstrap-1'};
g.KleenestMapEngineReady=ensure().catch(e=>{console.error('[Kleenest] Map engine bootstrap failed',e);return null});
})(window);