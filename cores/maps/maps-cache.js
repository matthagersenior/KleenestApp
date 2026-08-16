/* Maps Cache Module: durable browser cache with explicit freshness and safe fallback. */
export function createMapsCache({ ttlMs=5*60*1000, storageKey='kleenest.maps.locations.v1' }={}) {
 let value=null, savedAt=0;
 try{const raw=globalThis.localStorage?.getItem(storageKey);if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed.value)&&Number.isFinite(parsed.savedAt)){value=parsed.value;savedAt=parsed.savedAt}}}catch(_){ }
 function set(data){value=data;savedAt=Date.now();try{globalThis.localStorage?.setItem(storageKey,JSON.stringify({value,savedAt}))}catch(_){ }return value}
 function get(){return value}
 function isFresh(){return value!==null && Date.now()-savedAt<ttlMs}
 function clear(){value=null;savedAt=0;try{globalThis.localStorage?.removeItem(storageKey)}catch(_){ }}
 return Object.freeze({set,get,isFresh,clear});
}
