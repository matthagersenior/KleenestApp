/* Prevent legacy monolith auth handlers from competing with Supabase. */
(function(){'use strict';
 const api=window.kleenestLegacyAuthGuard=window.kleenestLegacyAuthGuard||{};
 const selectors='[data-do-login],[data-do-signup],[data-do-biz-signup],[data-do-logout]';
 const liveAuth=()=>!!window.KleenestRuntime?.supabaseReady?.();
 const control=target=>target?.closest?.(selectors);
 function block(e){if(!liveAuth())return;const c=control(e.target);if(!c)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();}
 ['pointerdown','mousedown','touchstart','click'].forEach(type=>document.addEventListener(type,block,true));
 document.addEventListener('click',function(e){if(!liveAuth())return;const c=control(e.target);if(c?.matches('[data-do-logout]'))window.dispatchEvent(new CustomEvent('kleenest:auth-logout'));},false);
 api.active=liveAuth;api.selector=selectors;
})();
