/* Kleenest account state coordinator. Uses the shared authentication lifecycle and existing account data layer. */
(function(){'use strict';
  const api=window.KleenestAccountState=window.KleenestAccountState||{};
  async function load(reason){
    const session=window.KleenestAuth?.get?.()||await window.KleenestAuth?.getSession?.();
    if(!session)return null;
    if(!window.KleenestAccount?.loadState)throw new Error('Account data layer is not ready.');
    const result=await window.KleenestAccount.loadState();
    const detail={reason:reason||'refresh',result,session};
    if(window.KleenestEvents?.emit)window.KleenestEvents.emit('account-state-refreshed',detail);else window.dispatchEvent(new CustomEvent('kleenest:account-state-refreshed',{detail}));
    return result;
  }
  api.load=load;
  window.KleenestUI=window.KleenestUI||{};
  window.KleenestUI.loadAccountState=load;
  window.addEventListener('kleenest:auth-state-changed',e=>{if(e.detail?.session)load('auth-state-changed').catch(error=>window.KleenestUI?.reportError?.('account-state-auth-refresh',error));});
})();