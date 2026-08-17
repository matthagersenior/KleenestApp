/* Kleenest business presentation renderer. */
(function(){'use strict';
  const api=window.KleenestBusinessRender=window.KleenestBusinessRender||{};
  const rootId='kleenest-business-live-panel';
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const businessRoot=()=>document.querySelector('[data-business-dashboard],#business-dashboard,.business-dashboard,[data-business-workspace],#business-workspace,.business-workspace');
  api.mount=function(detail){
    const s=detail?.result||detail;
    if(!s)return;
    const target=businessRoot();
    if(!target){api.clear();return;}
    const bs=s.businesses||[];
    let h=target.querySelector('#'+rootId);
    if(!h){h=document.createElement('section');h.id=rootId;h.setAttribute('aria-live','polite');h.className='kleenest-business-live-panel';target.appendChild(h);}
    if(!bs.length){h.innerHTML='';return;}
    h.innerHTML='<div class="kleenest-business-live-inner"><h3>Live Business Data</h3>'+bs.map(b=>{const d=b.dashboard||{},l=b.locations||[],r=b.reviews||[],p=b.promotions||[],m=b.membership||{};return '<article class="kleenest-business-card" data-business-id="'+esc(b.businessId)+'"><div><strong>'+esc(d.business_name||d.name||m.business_name||'Business')+'</strong><span> · '+esc(m.role||'member')+'</span></div><div class="kleenest-business-stats"><span>Locations: '+l.length+'</span><span>Reviews: '+r.length+'</span><span>Promotions: '+p.length+'</span></div></article>';}).join('')+'</div>';
  };
  api.clear=()=>document.getElementById(rootId)?.remove();
})();