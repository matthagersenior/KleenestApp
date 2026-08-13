/* Mobile/app-shell readiness helpers. Additive; no framework dependency. */
(function(){'use strict';
 const root=document.documentElement;
 function safeArea(){root.style.setProperty('--kleenest-safe-bottom','env(safe-area-inset-bottom, 0px)');root.style.setProperty('--kleenest-safe-top','env(safe-area-inset-top, 0px)');}
 function preventGhostTap(){document.addEventListener('touchend',e=>{const b=e.target.closest?.('button,[role="button"],a');if(!b)return;if(b.dataset.kleenestTouchHandled==='1'){e.preventDefault();return;}b.dataset.kleenestTouchHandled='1';setTimeout(()=>{try{delete b.dataset.kleenestTouchHandled;}catch(_){ }},450);},{passive:false});}
 function restoreScroll(){document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){setTimeout(()=>{if(document.activeElement?.matches?.('input,textarea,select'))return;window.scrollTo({top:window.scrollY,behavior:'instant'});},50);}});}
 function install(){safeArea();preventGhostTap();restoreScroll();window.addEventListener('pageshow',safeArea);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
 window.kleenestMobileReadiness={installed:true};
})();
