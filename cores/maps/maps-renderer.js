/* Maps Renderer: provider-neutral Leaflet adapter with an explicit provider injection point. */
export function createMapsRenderer({ provider=null }={}) {
  let mountRoot=null, map=null, markerLayer=null, lastContext=null;
  function paintLocations(locations=[],context){
    if(!map||!markerLayer)return;
    markerLayer.clearLayers();
    const valid=locations.filter(x=>Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lng)));
    valid.forEach(location=>{
      const marker=L.marker([Number(location.lat),Number(location.lng)]).addTo(markerLayer);
      const title=location.name||location.title||'Kleenest location';
      marker.bindPopup(`<strong>${escapeHtml(title)}</strong><br><button type="button" data-map-location="${escapeHtml(String(location.id))}">View details</button>`);
      marker.on('popupopen',()=>{const el=marker.getPopup().getElement()?.querySelector('[data-map-location]');if(el)el.onclick=()=>context.core.selectLocation(location.id).catch(console.error)});
    });
    if(valid.length&&!map._kmFitted){map.fitBounds(L.latLngBounds(valid.map(x=>[Number(x.lat),Number(x.lng)])),{padding:[24,24],maxZoom:15});map._kmFitted=true;}
  }
  function escapeHtml(v){return v.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  async function mount(root,context){
    mountRoot=root;lastContext=context;
    if(provider?.mount)return provider.mount(root,context);
    root.innerHTML='<div class="maps-renderer"><div class="maps-renderer__toolbar"><strong>Nearby clean places</strong><span data-map-count>Loading…</span></div><div class="maps-renderer__map" data-map-canvas></div><div class="maps-renderer__route" data-map-route></div></div>';
    if(typeof L==='undefined'){root.querySelector('[data-map-canvas]').innerHTML='<div class="maps-renderer__notice">Map provider is unavailable. Location discovery can still continue.</div>';return;}
    map=L.map(root.querySelector('[data-map-canvas]'),{zoomControl:true}).setView([38.5,-89.9],12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
    markerLayer=L.layerGroup().addTo(map);
    await refresh(context);
  }
  async function refresh(context){
    lastContext=context;
    const locations=await context.core.refreshDiscovery?.() || context.state.locations || [];
    context.state.locations=locations;
    if(map)paintLocations(locations,context);
    if(mountRoot)mountRoot.querySelector('[data-map-count]').textContent=`${locations.length} found`;
    return locations;
  }
  function destroy(){provider?.destroy?.();if(map){map.remove();map=null}markerLayer=null;mountRoot=null;lastContext=null}
  return Object.freeze({mount,refresh,destroy});
}