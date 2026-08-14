/* Map discovery bootstrap. Never blocks app startup; emits candidates whenever location is available. */
(function(){'use strict';
 const M=window.KleenestMapDiscovery=window.KleenestMapDiscovery||{}; M.version='1.0.0'; let lastKey=''; let inFlight=false;
 function emit(name,detail){window.KleenestEvents?.emit?window.KleenestEvents.emit(name,detail):window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}));}
 function coords(){const l=window.KleenestLocation?.get?.()||window.KleenestLocationState?.current||window.KleenestLiveState?.location;return l&&(Number.isFinite(+l.lat)&&Number.isFinite(+l.lng))?{lat:+l.lat,lng:+l.lng}:null;}
 async function load(reason='manual'){
   const c=coords(); if(!c)return {status:'waiting_for_location'}; const key=`${c.lat.toFixed(4)},${c.lng.toFixed(4)}`; if(inFlight)return {status:'in_flight'}; if(key===lastKey&&reason!=='update-location')return {status:'already_loaded'}; inFlight=true;
   try{let rows=[]; if(window.KleenestSupabase?.nearbyLocations)rows=await window.KleenestSupabase.nearbyLocations(c.lat,c.lng,25); else if(window.KleenestSupabase?.nearby_locations)rows=await window.KleenestSupabase.nearby_locations(c.lat,c.lng,25); const local=window.KleenestData?.restrooms||window.KleenestState?.restrooms||[]; const merged=[...rows,...local].reduce((a,x)=>{const k=x.id||`${x.name}|${x.lat}|${x.lng}`;if(!a.has(k)){a.set(k,x);}return a;},new Map()); const result=[...merged.values()]; lastKey=key; emit('kleenest:map-discovery-ready',{locations:result,coordinates:c,reason}); window.KleenestMap?.setLocations?.(result); window.KleenestUI?.renderLocations?.(result); return {status:'ready',locations:result};}
   catch(error){emit('kleenest:map-discovery-error',{error,coordinates:c,reason});return {status:'error',error};} finally{inFlight=false;}
 }
 M.load=load; M.refresh=()=>load('update-location');
 window.addEventListener('kleenest:location-updated',()=>load('location-updated'));
 window.addEventListener('kleenest:update-location',()=>load('update-location'));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>load('startup'),0),{once:true});else setTimeout(()=>load('startup'),0);
})();
