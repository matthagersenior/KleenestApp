/* Legacy auth guard: only suppress legacy handlers when no modular auth handler is active. */
(function(){'use strict';
 const api=window.kleenestLegacyAuthGuard=window.kleenestLegacyAuthGuard||{};
 const selectors='[data-do-login],[data-do-signup],[data-do-biz-signup],[data-do-logout]';
 const control=target=>target?.closest?.(selectors);
 const modular=()=>!!window.KleenestRuntime?.supabaseReady?.() && (!!window.KleenestRuntime?.__authUiInstalled || !!window.KleenestAuthSignup);
 function block(e){
   const c=control(e.target); if(!c)return;
   if(modular()){
     // Modular auth owns these controls. Do not cancel native focus, submit, or delegated handlers.
     return;
   }
   if(!window.KleenestRuntime?.supabaseReady?.())return;
   if(c.matches('[data-do-logout]')&&e.type==='click'){
     e.preventDefault();e.stopImmediatePropagation();window.dispatchEvent(new CustomEvent('kleenest:auth-logout'));
   }
 }
 ['pointerdown','mousedown','touchstart','click'].forEach(type=>document.addEventListener(type,block,true));
 api.active=()=>!!window.KleenestRuntime?.supabaseReady?.();api.selector=selectors;
})();