/* Modular map category filters. Keeps the full discovery set intact and filters the rendered map/list by discovery segment. */
(function(){'use strict';
  const api=window.KleenestMapCategoryFilters=window.KleenestMapCategoryFilters||{};
  const SEGMENTS={all:'All',toilets:'Bathrooms',gas_station:'Gas Stations',restaurant:'Restaurants/Fast Food',cafe:'Cafes/Coffee',retail:'Retail',public:'Public/Government',health:'Hospitals/Clinics',park:'Parks/Recreation',transit:'Transit/Airports',museum:'Museums'};
  let active='all',source=null,observer=null;
  function segment(r){return String(r?.segment||'').toLowerCase()||String(r?.placeType||'toilets').toLowerCase();}
  function isMaps(){return String(window.KleenestNavigation?.current?.()||'').toLowerCase()==='maps'||!!document.querySelector('#map');}
  function render(){
    if(!isMaps())return;
    const map=document.querySelector('#map');if(!map)return;
    const host=map.parentElement||map;
    let row=host.parentElement?.querySelector('[data-kleenest-category-filters]')||host.querySelector('[data-kleenest-category-filters]');
    if(!row){row=document.createElement('div');row.dataset.kleenestCategoryFilters='true';row.className='chip-row';row.style.margin='0 0 12px';host.parentNode.insertBefore(row,host);}
    row.innerHTML=Object.entries(SEGMENTS).map(([key,label])=>`<button type="button" class="chip ${key===active?'active':''}" data-kleenest-category="${key}">${key==='all'?'📍':key==='toilets'?'🚻':key==='gas_station'?'⛽':key==='restaurant'?'🍔':key==='cafe'?'☕':key==='retail'?'🛍️':key==='public'?'🏛️':key==='health'?'🏥':key==='park'?'🌳':key==='transit'?'✈️':'🏛️'} ${label}</button>`).join('');
    row.querySelectorAll('[data-kleenest-category]').forEach(btn=>btn.addEventListener('click',()=>apply(btn.dataset.kleenestCategory)));
  }
  function apply(key){
    active=SEGMENTS[key]?key:'all';
    if(!Array.isArray(window.state?.restrooms))return;
    if(!source)source=window.state.restrooms.map(x=>({...x}));
    const base=source;
    window.state.restrooms=active==='all'?[...base]:base.filter(r=>segment(r)===active);
    try{window.render?.();}catch(e){console.warn('[Kleenest] category filter render failed',e);}
    setTimeout(render,0);
  }
  function resetSource(){source=Array.isArray(window.state?.restrooms)?window.state.restrooms.map(x=>({...x})):source;}
  function boot(){
    resetSource();render();
    observer=new MutationObserver(()=>{if(document.querySelector('#map'))render();});
    observer.observe(document.body,{childList:true,subtree:true});
  }
  api.render=render;api.apply=apply;api.segments=()=>({...SEGMENTS});
  window.addEventListener('kleenest:map-discovery-ready',()=>{resetSource();setTimeout(render,0);});
  window.addEventListener('kleenest:public-bathrooms-ready',()=>{resetSource();setTimeout(render,0);});
  window.addEventListener('kleenest:navigation-changed',e=>{if(String(e.detail?.view||'').toLowerCase()==='maps')setTimeout(()=>{resetSource();render();},0);});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
