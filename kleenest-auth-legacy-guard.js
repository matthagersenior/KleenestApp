/* Prevent the legacy monolith auth handlers from competing with Supabase. */
(function(){'use strict';
  function liveAuth(){return !!window.KleenestRuntime?.supabaseReady?.();}
  function authMutation(target){return target?.closest?.('[data-do-login],[data-do-signup],[data-do-biz-signup]');}
  document.addEventListener('click',function(e){
    if(!liveAuth())return;
    if(authMutation(e.target)){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }
    if(e.target?.closest?.('[data-logout]')){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.dispatchEvent(new CustomEvent('kleenest:auth-logout'));
    }
  },true);
})();
