/* Kleenest account UI controller. */
(function(){'use strict';
  const account=window.KleenestAccountUI=window.KleenestAccountUI||{};
  function emit(name,detail){window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}));}
  async function load(reason){
    if(!window.KleenestAccount?.loadState) throw new Error('Account data layer is not ready.');
    const result=await window.KleenestAccount.loadState();
    account.state=result;
    emit('kleenest:account-ui-loaded',{reason:reason||'load',state:result});
    return result;
  }
  function render(target,state){
    const root=typeof target==='string'?document.querySelector(target):target;
    if(!root)return false;
    const s=state||account.state||{};
    const notifications=Array.isArray(s.notifications)?s.notifications:[];
    const sub=s.subscription||{};
    root.innerHTML='<div class="kleenest-account-summary"><strong>Account</strong><span data-account-user>'+String(s.userId||'')+'</span><span data-account-subscription>'+String(sub.status||sub.plan||'')+'</span><span data-account-notifications>'+notifications.length+' notifications</span></div>';
    return true;
  }
  account.load=load;
  account.render=render;
  account.refresh=reason=>load(reason||'account-ui-refresh');
  window.KleenestUI=window.KleenestUI||{};
  window.KleenestUI.loadAccountState=account.load;
  window.KleenestUI.renderAccount=account.render;
  window.addEventListener('kleenest:auth-state-changed',e=>{if(e.detail?.session)load('auth-state-changed').catch(()=>{});});
})();