/* Kleenest account state coordinator. Uses the existing account data layer without duplicating database access. */
(function(){'use strict';
  window.KleenestAccountState=window.KleenestAccountState||{};
  async function load(reason){
    if(!window.KleenestAccount?.loadState) return null;
    const result=await window.KleenestAccount.loadState();
    window.dispatchEvent(new CustomEvent('kleenest:account-state-refreshed',{detail:{reason:reason||'refresh',result}}));
    return result;
  }
  window.KleenestAccountState.load=load;
  window.KleenestUI=window.KleenestUI||{};
  window.KleenestUI.loadAccountState=load;
  window.addEventListener('kleenest:auth-state-changed',e=>{if(e.detail?.session)load('auth-state-changed').catch(()=>{});});
})();