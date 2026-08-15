/* Maps control policy: GPS is already active, so the manual action updates GPS and refreshes data. */
(function(global){'use strict';
if(global.__KLEENEST_MAP_CONTROLS__)return;global.__KLEENEST_MAP_CONTROLS__=true;
let observer=null;
let applying=false;
function patch(){
  if(applying)return;
  const btn=document.getElementById('maps-use-location');
  const refresh=document.getElementById('maps-refresh');
  if(!btn && !refresh)return;
  const desired='📍 Update my location';
  const needsText=!!btn && btn.textContent!==desired;
  const needsAria=!!btn && btn.getAttribute('aria-label')!=='Update my location and refresh nearby locations';
  if(!needsText && !needsAria && !refresh)return;
  applying=true;
  try{
    if(btn){
      if(needsText)btn.textContent=desired;
      if(needsAria)btn.setAttribute('aria-label','Update my location and refresh nearby locations');
    }
    if(refresh)refresh.remove();
  }finally{
    applying=false;
  }
}
function observe(){
  if(observer)return;
  observer=new MutationObserver(()=>{
    // Run once per task; never mutate the DOM from an unguarded observer callback.
    if(!applying)patch();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true});
}
function start(){patch();observe();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
global.KleenestMapControls={patch,start};
})(window);