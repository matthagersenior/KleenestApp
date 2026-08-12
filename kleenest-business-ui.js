/* Kleenest business dashboard UI controller. */
(function () {
  'use strict';
  window.KleenestBusinessUI = window.KleenestBusinessUI || {};
  const rootId = 'kleenest-business-live-panel';
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function mount(detail){
    const state=detail?.result||detail;if(!state)return;
    const businesses=state.businesses||[];
    let host=document.getElementById(rootId);
    if(!host){host=document.createElement('section');host.id=rootId;host.setAttribute('aria-live','polite');host.className='kleenest-business-live-panel';const target=document.querySelector('[data-business-dashboard], #business-dashboard, .business-dashboard')||document.body;target.appendChild(host);}
    if(!businesses.length){host.innerHTML='';return;}
    host.innerHTML='<div class="kleenest-business-live-inner"><h3>Live Business Data</h3>'+businesses.map(b=>{const d=b.dashboard||{};const l=b.locations||[];const r=b.reviews||[];const m=b.membership||{};return '<article class="kleenest-business-card" data-business-id="'+esc(b.businessId)+'"><div><strong>'+esc(d.business_name||d.name||m.business_name||'Business')+'</strong><span> · '+esc(m.role||'member')+'</span></div><div class="kleenest-business-stats"><span>Locations: '+l.length+'</span><span>Reviews: '+r.length+'</span></div><div class="kleenest-business-controls"><button type="button" data-kleenest-business-action="refresh">Refresh</button><button type="button" data-kleenest-business-action="invite">Invite Member</button></div></article>';}).join('')+'</div>';
  }
  function clear(){document.getElementById(rootId)?.remove();}
  async function action(el){const card=el.closest('[data-business-id]');const businessId=card?.dataset.businessId;const actionName=el.dataset.kleenestBusinessAction;if(!businessId)return;if(actionName==='refresh')return window.KleenestUI?.loadBusinessState?.('business-ui-refresh');if(actionName==='invite'){const userId=window.prompt('Enter the user ID to invite:');if(!userId)return;const role=window.prompt('Role (owner, manager, staff):','staff')||'staff';return window.KleenestUI?.runBusinessAction?.('inviteMember',{businessId,userId,role});}}
  window.KleenestBusinessUI.mount=mount;
  window.KleenestBusinessUI.clear=clear;
  document.addEventListener('click',e=>{const el=e.target.closest?.('[data-kleenest-business-action]');if(el)action(el).catch(error=>window.dispatchEvent(new CustomEvent('kleenest:action-error',{detail:{action:'business-ui',error}})));});
  window.addEventListener('kleenest:business-state-loaded',e=>mount(e.detail));
  window.addEventListener('kleenest:auth-state-changed',e=>{if(!e.detail?.session)clear();});
  window.addEventListener('kleenest:business-mutated',()=>window.KleenestUI?.loadBusinessState?.('business-mutated-ui'));
  if(window.KleenestUI?.loadBusinessState)window.KleenestUI.loadBusinessState('business-ui-ready').catch(()=>{});
})();