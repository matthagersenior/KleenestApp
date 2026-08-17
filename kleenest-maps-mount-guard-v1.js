/* Kleenest Maps mount guard v1 — keeps the canonical map visible while cache/discovery warms. */
(function(g){'use strict';
if(g.__KLEENEST_MAP_MOUNT_GUARD_V1__)return;g.__KLEENEST_MAP_MOUNT_GUARD_V1__=true;
var original=null,wrapped=false;
function wrap(api){if(!api||wrapped||typeof api.mount!=='function')return api;wrapped=true;original=api.mount;api.mount=async function(root){
  var rerendered=false,alive=true;
  try{
    if(!g.KleenestMapPreloader){await new Promise(function(resolve,reject){var s=document.createElement('script');s.src='kleenest-map-preloader.js?guard=1';s.onload=resolve;s.onerror=function(){reject(new Error('Maps data service failed to load'))};document.head.appendChild(s)})}
    if(g.KleenestMapPreloader&&g.KleenestMapPreloader.load){try{await g.KleenestMapPreloader.load()}catch(e){console.warn('[Kleenest Maps] preload warm-up failed',e)}}
  }catch(e){console.warn('[Kleenest Maps] mount warm-up failed',e)}
  var onData=function(e){
    if(rerendered||!alive||!root||!root.isConnected)return;
    var count=Number(e&&e.detail&&e.detail.count||g.KleenestMapCache&&g.KleenestMapCache.locations&&g.KleenestMapCache.locations.length||0);
    if(count<=0)return;
    rerendered=true;
    setTimeout(function(){if(alive&&root&&root.isConnected)original(root).catch(function(err){console.warn('[Kleenest Maps] data refresh mount failed',err)})},50);
  };
  g.addEventListener('kleenest:map-data-updated',onData);
  var result=await original(root);
  setTimeout(function(){alive=false;g.removeEventListener('kleenest:map-data-updated',onData)},15000);
  return result;
};return api}
function install(){var desc=Object.getOwnPropertyDescriptor(g,'KleenestCanonicalMapsV8');if(desc&&desc.configurable===false)return;try{
  var current=g.KleenestCanonicalMapsV8;
  Object.defineProperty(g,'KleenestCanonicalMapsV8',{configurable:true,enumerable:true,get:function(){return current},set:function(v){current=wrap(v)}});
  if(current)current=wrap(current);
}catch(e){console.warn('[Kleenest Maps] mount guard unavailable',e)}}
install();
})(window);
