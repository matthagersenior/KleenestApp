/* Business location context v1: restores the location selector without replacing the Business workspace. */
(function(){'use strict';
  const W=window.KleenestBusinessWorkspace;if(!W||W.__locationContextV1)return;W.__locationContextV1=true;
  let selected='all';
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const oldMount=W.mount;
  function locations(){return W.getContext?.().locations||[]}
  function inject(root){
    const toolbar=root.querySelector('.biz-toolbar');if(!toolbar||toolbar.querySelector('#business-location'))return;
    const locs=locations();
    const label=document.createElement('label');label.innerHTML='Location<select id="business-location"><option value="all">All locations</option>'+locs.map(l=>`<option value="${esc(l.id)}" ${String(l.id)===String(selected)?'selected':''}>${esc(l.name)}</option>`).join('')+'</select>';
    label.style.cssText='font-size:.7rem;font-weight:900;color:#63766f;display:block;margin-top:12px';
    const select=label.querySelector('select');select.style.cssText='display:block;width:100%;margin-top:7px;min-height:48px;padding:10px;border:1px solid #cddfd8;border-radius:13px;background:#fff;font:inherit';
    select.addEventListener('change',()=>{selected=select.value;apply(root)});toolbar.appendChild(label);
  }
  function apply(root){
    const locs=locations();const current=locs.find(l=>String(l.id)===String(selected));
    let banner=root.querySelector('.biz-location-context');
    if(!banner){banner=document.createElement('div');banner.className='biz-location-context';const toolbar=root.querySelector('.biz-toolbar');toolbar?.after(banner)}
    banner.innerHTML=selected==='all'?'<b>All locations</b><span>Showing the business portfolio.</span>':`<b>${esc(current?.name||'Selected location')}</b><span>Location context selected. Dataset results below are scoped where the underlying record includes a location.</span>`;
    banner.style.cssText='display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:12px;padding:12px 14px;border:1px solid #dbe8e3;border-radius:14px;background:#f7fbf9;color:#34574d;font-size:.78rem';
    root.querySelectorAll('.biz-location-card').forEach(card=>{const id=card.dataset.locationId;if(id)card.style.display=selected==='all'||String(id)===String(selected)?'':'none'});
    root.querySelectorAll('.biz-crud-row').forEach(row=>{const id=row.dataset.locationId;if(id)row.style.display=selected==='all'||String(id)===String(selected)?'':'none'});
  }
  async function mount(root){await oldMount.call(W,root);inject(root);apply(root)}
  W.mount=mount;
})();