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
  async function requestDeletion(button){
    if(button?.dataset.busy==='1')return;
    if(!window.KleenestAccountLifecycle?.requestDeletion)throw new Error('Account lifecycle is not ready.');
    if(!confirm('Request deletion of your Kleenest account? This starts the secure deletion process.'))return;
    const reason=prompt('Optional reason for deletion:','');
    if(reason===null)return;
    if(button){button.dataset.busy='1';button.disabled=true;button.dataset.previousText=button.textContent;button.textContent='Submitting…';}
    try{const result=await window.KleenestAccountLifecycle.requestDeletion(reason);emit('kleenest:account-deletion-requested',{result});alert('Your deletion request was submitted. Support will verify and process it.');}
    catch(error){console.error('Account deletion request failed',error);alert(error?.message||'Unable to submit the deletion request.');}
    finally{if(button){button.dataset.busy='0';button.disabled=false;button.textContent=button.dataset.previousText||'Request account deletion';}}
  }
  function wireDeletionControls(){
    document.querySelectorAll('[data-account-delete]').forEach(button=>{button.setAttribute('type','button');button.setAttribute('aria-describedby','kleenest-account-delete-help');});
    if(!document.getElementById('kleenest-account-delete-help')){const help=document.createElement('p');help.id='kleenest-account-delete-help';help.hidden=true;help.textContent='Account deletion requests are submitted securely and require account verification.';document.body.appendChild(help);}
  }
  document.addEventListener('click',e=>{const button=e.target.closest?.('[data-account-delete]');if(!button)return;e.preventDefault();e.stopImmediatePropagation();requestDeletion(button).catch(error=>console.error(error));},true);
  account.load=load; account.render=render; account.refresh=reason=>load(reason||'account-ui-refresh'); account.requestDeletion=()=>requestDeletion(null);
  window.KleenestUI=window.KleenestUI||{}; window.KleenestUI.loadAccountState=account.load; window.KleenestUI.renderAccount=account.render;
  window.addEventListener('kleenest:auth-state-changed',e=>{if(e.detail?.session)load('auth-state-changed').catch(()=>{});wireDeletionControls();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wireDeletionControls,{once:true});else wireDeletionControls();
})();
