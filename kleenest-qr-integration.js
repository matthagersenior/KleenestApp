/* QR integration for the modular consumer + Business surfaces. */
(function(){'use strict';
 function root(){return document.getElementById('modular-root');}
 async function mountBusinessQr(){const r=root();if(!r||!window.KleenestBusinessWorkspace?.getContext||!window.KleenestQR?.businessCard)return;const ctx=window.KleenestBusinessWorkspace.getContext();const locations=ctx?.model?.locations||[];const location=locations[0]||ctx?.model?.location||null;if(!location?.id)return;let slot=r.querySelector('[data-kleenest-business-qr]');if(!slot){slot=document.createElement('div');slot.dataset.kleenestBusinessQr='true';const stack=r.querySelector('section.stack')||r.querySelector('main')||r;stack.appendChild(slot);}slot.innerHTML=await window.KleenestQR.businessCard(location);window.KleenestQR.bind(slot);}
 function mountDetailsQr(){const r=root();if(!r||!window.KleenestQR)return;const existing=r.querySelector('[data-kleenest-qr-consumer]');if(existing)return;const buttons=r.querySelectorAll('#scan-qr,#scan-qr-2');buttons.forEach(b=>b.onclick=()=>window.KleenestQR.scan());}
 function schedule(){setTimeout(()=>{mountBusinessQr().catch(()=>{});mountDetailsQr();},120);}
 document.addEventListener('click',e=>{if(e.target.closest('[data-view="Business"]')||e.target.closest('[data-view="Admin"]')||e.target.closest('[data-biz-action]'))schedule();if(e.target.closest('#scan-qr')||e.target.closest('#scan-qr-2')||e.target.closest('[data-scan-qr]')){e.preventDefault();window.KleenestQR?.scan?.();}});
 document.addEventListener('change',e=>{if(e.target.id==='business-dataset')schedule();});
 window.addEventListener('kleenest:business-refresh',schedule);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
})();