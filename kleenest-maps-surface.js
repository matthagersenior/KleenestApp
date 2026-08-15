/* Authoritative modular Maps surface. Uses existing discovery/location modules without importing the monolith. */
(function(){'use strict';
 const M=window.KleenestMapsSurface=window.KleenestMapsSurface||{};
 const esc=v=>String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
 const rows=()=>window.KleenestData?.restrooms||window.KleenestState?.restrooms||[];
 M.mount=async function(root){
  if(!root)return;
  root.innerHTML='<section class="stack"><div class="card accent"><h1>Nearby locations</h1><p class="muted" id="maps-status">Finding nearby Kleenest locations…</p><div class="actions"><button type="button" class="primary" data-map-location>Use My Location</button><button type="button" class="secondary" data-map-refresh>Refresh</button></div></div><div class="card"><h3>Location categories</h3><div class="tabs-row" data-map-cats><button type="button" class="tab-button active" data-map-cat="all">All</button><button type="button" class="tab-button" data-map-cat="toilets">Bathrooms</button><button type="button" class="tab-button" data-map-cat="restaurant">Restaurants</button><button type="button" class="tab-button" data-map-cat="cafe">Cafes</button><button type="button" class="tab-button" data-map-cat="retail">Retail</button></div></div><div class="card"><h3>Locations</h3><div id="map-location-list"></div></div></section>';
  const list=root.querySelector('#map-location-list'),status=root.querySelector('#maps-status');
  const render=(filter='all')=>{let data=rows();if(filter!=='all')data=data.filter(x=>String(x.segment||x.placeType||'toilets').toLowerCase()===filter);list.innerHTML=data.length?data.slice(0,50).map(x=>'<article class="feed-item"><div><strong>'+esc(x.name||'Location')+'</strong><div class="muted">'+esc(x.address||x.city||x.description||'Nearby location')+'</div></div><span class="badge">'+esc(x.segment||x.placeType||'Bathroom')+'</span></article>').join(''):'<p class="muted">No locations are loaded yet. Use My Location or Refresh.</p>';};
  const discover=async reason=>{try{status.textContent='Finding nearby locations…';await window.KleenestMapDiscovery?.load?.(reason||'maps-surface');status.textContent='Nearby locations';render()}catch(e){status.textContent=e.message||'Unable to load locations.';render()}};
  root.querySelector('[data-map-location]').onclick=async()=>{try{status.textContent='Requesting location permission…';await window.KleenestLocation?.getCurrentPosition?.();await discover('location-button')}catch(e){status.textContent=e.message||'Location permission was not available.'}};
  root.querySelector('[data-map-refresh]').onclick=()=>discover('manual-refresh');
  root.querySelectorAll('[data-map-cat]').forEach(b=>b.onclick=()=>{root.querySelectorAll('[data-map-cat]').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.mapCat)});
  window.addEventListener('kleenest:map-discovery-ready',()=>{status.textContent='Nearby locations';render()}, {once:false});
  render();
  if(window.KleenestLocation?.get?.())discover('existing-location');
 };
})();