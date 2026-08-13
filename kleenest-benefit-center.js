/* User Benefit Center — available programs and Preferred Location history. */
(function(){
 'use strict';
 async function render(container){
  if(!container||!window.kleenestPreferredHistory)return;
  container.textContent='Loading your benefits…';
  try{
   const items=await window.kleenestPreferredHistory.load();
   container.innerHTML='<section class="benefit-center"><h3>Your Kleenest Benefits</h3><div data-benefits></div></section>';
   const box=container.querySelector('[data-benefits]');
   if(!items.length){box.textContent='No Preferred Locations are active yet.';return;}
   items.forEach(x=>{const el=document.createElement('article');el.className='benefit-item';el.innerHTML='<strong>Preferred Location</strong><div>Activated '+new Date(x.activated_at).toLocaleDateString()+'</div><div>Uses: '+x.use_count+'</div>';if(x.deactivated_at)el.insertAdjacentHTML('beforeend','<div>Inactive</div>');box.appendChild(el);});
  }catch(e){container.textContent='Unable to load benefits.';console.warn('[Kleenest]',e);}
 }
 window.kleenestRenderBenefitCenter=render;
})();
