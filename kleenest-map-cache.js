/* Persistent Maps cache: localStorage first, shared in-memory session reuse, background refresh. */
(function(global){'use strict';
if(global.KleenestMapCacheService)return;
const KEY='kleenest.maps.cache.v8';
const TTL=15*60*1000,STALE=7*24*60*60*1000;
const mem=global.KleenestMapCache=global.KleenestMapCache||{locations:[],user:null,accuracy:0,loaded:false,loadedAt:0,loading:null};
function expose(){global.KleenestLocations=mem.locations;global.KleenestMapBrowserLocation=mem.user||null;global.KleenestMapReady=mem.loaded}
function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(!v||!Array.isArray(v.locations)||Date.now()-Number(v.savedAt||0)>STALE)return null;return v}catch(e){return null}}
function write(){try{localStorage.setItem(KEY,JSON.stringify({locations:mem.locations.slice(0,5000),user:mem.user,accuracy:mem.accuracy,savedAt:Date.now()}))}catch(e){}}
function merge(rows){const seen=new Map();(Array.isArray(rows)?rows:[]).forEach((x,i)=>{if(!x)return;let lat=Number(x.lat??x.latitude),lng=Number(x.lng??x.lon??x.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lng))return;let y=Object.assign({},x,{lat,lng,id:x.id||'cached-'+i});let k=(String(y.name||'').toLowerCase().trim()+'|'+lat.toFixed(5)+'|'+lng.toFixed(5));if(!seen.has(k))seen.set(k,y)});mem.locations=Array.from(seen.values());expose();mem.loaded=true;mem.loadedAt=Date.now();write();return mem.locations}
function hydrate(){const v=read();if(!v)return false;mem.locations=v.locations;mem.user=v.user||null;mem.accuracy=Number(v.accuracy||0);mem.loaded=true;mem.loadedAt=Number(v.savedAt||0);expose();return true}
function fresh(){return mem.loaded&&Date.now()-mem.loadedAt<TTL}
async function refresh(){if(mem.loading)return mem.loading;mem.loading=(async()=>{const p=mem.user||{lat:38.1231,lng:-89.702};let all=mem.locations.slice();try{if(global.KleenestSupabase?.nearbyLocations)all=all.concat(await global.KleenestSupabase.nearbyLocations(p.lat,p.lng,25))}catch(e){}try{if(global.KleenestMapExternalDiscovery?.nearby)all=all.concat(await global.KleenestMapExternalDiscovery.nearby(p.lat,p.lng,25000))}catch(e){}try{all=all.concat((global.KleenestData?.restrooms)||(global.KleenestState?.restrooms)||[])}catch(e){}return merge(all)})().finally(()=>{mem.loading=null});return mem.loading}
hydrate();global.KleenestMapCacheService={cache:mem,hydrate,write,merge,fresh,refresh,TTL,STALE};
})(window);