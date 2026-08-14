/* Modular map category filters. Filters the current discovery set without observing the whole DOM. */
(function(){'use strict';
 const api=window.KleenestMapCategoryFilters=window.KleenestMapCategoryFilters||{};
 const SEGMENTS={all:'All',toilets:'Bathrooms',gas_station:'Gas Stations',restaurant:'Restaurants/Fast Food',cafe:'Cafes/Coffee',retail:'Retail',public:'Public/Government',health:'Hospitals/Clinics',park:'Parks/Recreation',transit:'Transit/Airports',museum:'Museums'};
 let active='all',source=[];
 function segment(r){return String(r?.segment||r?.placeType||'toilets').toLowerCase();}
 function isMaps(){return String(window.KleenestNavigation?.current?.()||'').toLowerCase()==='maps'||!!document.querySelector('#map');}
 function render(){if(!isMaps())return;const map=document.querySelector('#map');if(!map)return;const host=map.parentElement||map;let row=host.parentElement?.querySelector('[data-kleenest-category-filters]')||host.querySelector('[data-kleenest-category-filters]');if(!row){row=document.createElement('div');row.dataset.kleenestCategoryFilters='true';row.className='chip-row';row.style.margin='0 0 12px';host.parentNode.insertBefore(row,host);}row.innerHTML=Object.entries(SEGMENTS).map(([key,label])=>`<button type="button" class="chip ${key===active?'active':''}" data-kleenest-category="${key}">${key==='all'?'📍':key==='toilets'?'🚻':key==='gas_station'?'⛽':key==='restaurant'?'🍔':key==='cafe'?'☕':key==='retail'?'🛍️':key==='public'?'🏛️':key==='health'?'🏥':key==='park'?'🌳':key==='transit'?'✈️':'🏛️'} ${label}</button>`).join('');row.querySelectorAll('[data-kleenest-category]').forEach(btn=>btn.addEventListener('click',()=>apply(btn.dataset.kleenestCategory)));}
 function apply(key){active=SEGMENTS[key]?key:'all';if(!Array.isArray(window.state?.restrooms))return;if(!source.length)source=window.state.restrooms.map(x=>({...x}));window.state.restrooms=active==='all'?[...source]:source.filter(r=>segment(r)===active);try{window.render?.();}catch(e){console.warn('[Kleenest] category filter render failed',e);}setTimeout(render,0);}
 function resetSource(){if(Array.isArray(window.state?.restrooms)&&window.state.restrooms.length)source=window.state.restrooms.map(x=>({...x}));}
 function boot(){resetSource();render();}
 api.render=render;api.apply=apply;api.segments=()=>({...SEGMENTS});
 ['kleenest:map-discovery-ready','kleenest:public-bathrooms-ready','kleenest:osm-discovery-ready'].forEach(ev=>window.addEventListener(ev,()=>{if(active==='all')resetSource();setTimeout(render,0);}));
 window.addEventListener('kleenest:navigation-changed',e=>{if(String(e.detail?.view||'').toLowerCase()==='maps')setTimeout(()=>{resetSource();render();},0);});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
