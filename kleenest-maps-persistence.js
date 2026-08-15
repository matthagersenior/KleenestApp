/* Navigation-safe Maps persistence coordinator. Keeps one cache and one GPS watcher alive for the app session. */
(function(global){'use strict';
if(global.__KLEENEST_MAP_PERSISTENCE__)return;global.__KLEENEST_MAP_PERSISTENCE__=true;
const C=global.KleenestMapCache=global.KleenestMapCache||{locations:[],user:null,accuracy:0,loaded:false,loading:null,loadedAt:0};
function expose(){global.KleenestLocations=C.locations;global.KleenestMapBrowserLocation=C.user||null}
function hydrate(){try{const v=JSON.parse(localStorage.getItem('kleenest.maps.cache.v4')||'null');if(v&&Array.isArray(v.locations)){C.locations=v.locations;C.user=v.user||null;C.accuracy=Number(v.accuracy||0);C.loaded=true;C.loadedAt=Number(v.savedAt||0);expose()}}catch(e){}}
function watch(){if(C._watch||!navigator.geolocation)return;C._watch=navigator.geolocation.watchPosition(p=>{C.user={lat:p.coords.latitude,lng:p.coords.longitude};C.accuracy=p.coords.accuracy||0;expose();try{localStorage.setItem('kleenest.maps.cache.v4',JSON.stringify({locations:C.locations,user:C.user,accuracy:C.accuracy,savedAt:Date.now()}))}catch(e){}global.dispatchEvent(new CustomEvent('kleenest:map-location-updated',{detail:{location:C.user,accuracy:C.accuracy}}))},()=>{},{enableHighAccuracy:true,maximumAge:30000,timeout:15000})}
hydrate();watch();global.KleenestMapPersistence={cache:C,hydrate,watch,expose};global.dispatchEvent(new CustomEvent('kleenest:map-persistence-ready'));
})(window);