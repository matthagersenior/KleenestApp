/* Kleenest Maps Core — authoritative modular Maps surface for refactor/monolith-removal. */
const DEFAULT_MODULES=Object.freeze(['location','discovery','cache','session','catalog','verification','engagement','details','filters','renderer','routes','progression','social','business']);
export function createMapsCore({supabase,root,user=null,modules={}}={}){
 if(!root)throw new Error('Maps Core requires a mount root.');
 const state={user,destroyed:false,ready:false,modules:Object.freeze({...modules}),selectedLocationId:null,filters:{},locations:[],status:'initializing'};
 const missing=DEFAULT_MODULES.filter(n=>!state.modules[n]);
 function contract(){return Object.freeze({version:'1.1.0',core:'maps',modules:DEFAULT_MODULES.slice(),required:DEFAULT_MODULES.slice(),missing});}
 async function refreshDiscovery(){
  const context={supabase,user:state.user,state,core:api};
  let locations=[];
  if(state.modules.cache.isFresh()) locations=state.modules.cache.get()||[];
  try{locations=await state.modules.discovery.refresh({filters:state.filters,user:state.user,position:state.modules.location.get()?.position});state.modules.cache.set(locations)}catch(error){if(!locations.length)throw error;console.warn('[Maps] discovery refresh failed; using cached data',error)}
  state.locations=locations;return locations;
 }
 async function initialize(){
  if(state.destroyed)return;
  state.status='initializing';root.replaceChildren();root.innerHTML=`<section class="maps-core" data-maps-core><div class="maps-core__hero"><span class="maps-core__eyebrow">KLEENEST MAPS</span><h1>Clean places, verified by the community.</h1><p>Discover, verify, check in, plan routes and earn progression rewards in one coordinated map.</p><div class="maps-core__quick"><button type="button" data-map-action="locate">Use my location</button><button type="button" data-map-action="route">Plan a route</button></div></div><div class="maps-core__status" data-maps-status>Preparing your map…</div><div class="maps-core__surface" data-maps-surface></div><div class="maps-core__details" data-maps-details></div></section>`;
  if(missing.length){state.status='configuration_error';root.querySelector('[data-maps-status]').textContent=`Maps Core is missing modules: ${missing.join(', ')}.`;return}
  const context={supabase,user:state.user,state,core:api};
  for(const name of DEFAULT_MODULES){const mod=state.modules[name];if(typeof mod.initialize==='function')await mod.initialize(context)}
  try{await state.modules.location.request()}catch(_){}
  try{await refreshDiscovery()}catch(error){console.warn('[Maps] discovery unavailable',error)}
  state.ready=true;state.status='ready';root.querySelector('[data-maps-status]').textContent=state.locations.length?`${state.locations.length} nearby locations ready.`:'Map ready — searching for nearby locations…';
  root.querySelector('[data-map-action="locate"]').onclick=()=>state.modules.location.request().catch(()=>{});
  root.querySelector('[data-map-action="route"]').onclick=()=>openRoutePanel();
  if(typeof state.modules.renderer.mount==='function')await state.modules.renderer.mount(root.querySelector('[data-maps-surface]'),context);
  renderDetails();
 }
 async function selectLocation(locationId){if(!state.ready)throw new Error('Maps Core is not ready.');state.selectedLocationId=locationId;const result=await state.modules.details?.open?.(locationId,{state,user:state.user});renderDetails(result);return result}
 function renderDetails(result=null){const el=root.querySelector('[data-maps-details]');if(!el)return;if(!result){el.innerHTML='<div class="maps-details-card"><strong>Explore the map</strong><span>Select a location to see verification, check-in, favorite and route actions.</span></div>';return}const l=result.location;el.innerHTML=`<div class="maps-details-card"><div><strong>${escapeHtml(l.name||l.title||'Location')}</strong><span>${escapeHtml(l.address||l.description||'Community location')}</span></div><div class="maps-details-actions"><button data-detail="checkin">Check in</button><button data-detail="favorite">Favorite</button><button data-detail="route">Add to route</button><button data-detail="verify">Verify</button></div></div>`;el.querySelector('[data-detail="checkin"]').onclick=()=>result.actions.checkIn().catch(showActionError);el.querySelector('[data-detail="favorite"]').onclick=()=>result.actions.favorite(true).catch(showActionError);el.querySelector('[data-detail="route"]').onclick=()=>result.actions.addToRoute().catch(showActionError);el.querySelector('[data-detail="verify"]').onclick=()=>result.actions.verify({method:'community'}).catch(showActionError)}
 function showActionError(error){console.error('[Maps action]',error);const status=root.querySelector('[data-maps-status]');if(status)status.textContent=error?.message||'That Maps action could not be completed.'}
 function openRoutePanel(){const el=root.querySelector('[data-maps-details]');if(!el)return;el.innerHTML='<div class="maps-details-card"><strong>Route planner</strong><span>Add locations from the map, reorder stops, then start your route.</span><div class="maps-details-actions"><button data-route="create">Create route</button><button data-route="history">Route history</button></div></div>';el.querySelector('[data-route="create"]').onclick=async()=>{try{const route=await state.modules.routes.create();el.querySelector('strong').textContent=route.title;el.querySelector('span').textContent='Route created. Add stops from location details, then start it.'}catch(e){showActionError(e)}};el.querySelector('[data-route="history"]').onclick=async()=>{try{const routes=await state.modules.routes.listMine();el.querySelector('span').textContent=`You have ${routes.length} saved route${routes.length===1?'':'s'}.`}catch(e){showActionError(e)}}}
 function setFilters(filters={}){state.filters={...filters};state.modules.filters?.apply?.(state.filters,{state});return refreshDiscovery()}
 function destroy(){if(state.destroyed)return;const context={supabase,user:state.user,state,core:api};for(const name of [...DEFAULT_MODULES].reverse()){try{state.modules[name]?.destroy?.(context)}catch(error){console.error(`[Maps Core] ${name} destroy failed`,error)}}state.destroyed=true;root.replaceChildren()}
 const api=Object.freeze({contract,initialize,refresh:refreshDiscovery,refreshDiscovery,selectLocation,setFilters,destroy,get state(){return {...state,modules:undefined}}});return api;
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}