/* Persistent Maps cache: localStorage first, in-memory session reuse, background refresh. */
(function(global){'use strict';
if(global.KleenestMapCacheService)return;
const KEY='kleenest.maps.cache.v2';
const TTL=10*60*1000;
const STALE=24*60*60*1000;
const mem=global.KleenestMapCache=global.KleenestMapCache||{locations:[],user:null,accuracy:0,loaded:false,loadedAt:0,loading:null};
function read(){try{const raw=localStorage.getItem(KEY);if(!raw)return null;const v=JSON.parse(raw);if(!v||!Array.isArray(v.locations))return null;if(Date.now()-Number(v.savedAt||0)>STALE)return null;return v}catch(e){return null}}
function write(){try{localStorage.setItem(KEY,JSON.stringify({locations:mem.locations,user:mem.user,accuracy:mem.accuracy,savedAt:Date.now()}))}catch(e){}}
function merge(rows){const seen=new Set();mem.locations=(Array.isArray(rows)?rows:[]).filter(x=>x&&Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lng))).map((x,i)=>Object.assign({},x,{lat:Number(x.lat),lng:Number(x.lng),id:x.id||'cached-'+i})).filter(x=>{const k=String(x.source||'data')+'|'+String(x.id||x.name+'|'+x.lat+'|'+x.lng);if(seen.has(k))return false;seen.add(k);return true});global.KleenestLocations=mem.locations;mem.loaded=true;mem.loadedAt=Date.now();write();return mem.locations}
function hydrate(){const v=read();if(!v)return false;mem.locations=v.locations;mem.user=v.user||null;mem.accuracy=Number(v.accuracy||0);mem.loaded=true;mem.loadedAt=Number(v.savedAt||0);global.KleenestLocations=mem.locations;return true}
function fresh(){return mem.loaded&&Date.now()-mem.loadedAt<TTL}
async function refresh(){if(mem.loading)return mem.loading;mem.loading=(async()=>{const p=mem.user||{lat:38.1231,lng:-89.702};let all=[];try{if(global.KleenestSupabase?.nearbyLocations)all=all.concat(await global.KleenestSupabase.nearbyLocations(p.lat,p.lng,25))}catch(e){}try{if(global.KleenestMapExternalDiscovery?.nearby)all=all.concat(await global.KleenestMapExternalDiscovery.nearby(p.lat,p.lng,25000))}catch(e){}try{all=all.concat((global.KleenestData?.restrooms)||(global.KleenestState?.restrooms)||[])}catch(e){}return merge(all)})().finally(()=>{mem.loading=null});return mem.loading}
hydrate();
global.KleenestMapCacheService={cache:mem,hydrate,write,merge,fresh,refresh,TTL,STALE};
})(window);