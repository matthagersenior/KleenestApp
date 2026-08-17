/* Kleenest Maps Core v5 — one lifecycle owner for discovery, social engagement, progression, routing and live navigation. */
import { createMapsLocation } from './maps-location.js';
import { createMapsDiscovery } from './maps-discovery.js';
import { createMapsFilters } from './maps-filters.js';
import { createMapsCache } from './maps-cache.js';
import { createMapsSession } from './maps-session.js';
import { createMapsRenderer } from './maps-renderer.js';
import { createMapsRouting } from './maps-routing.js';
import { createMapsRoutes } from './maps-routes.js';
import { createMapsProgression } from './maps-progression.js';
import { createMapsEngagement } from './maps-engagement.js';
import { createMapsVerification } from './maps-verification.js';
import { createMapsDetails } from './maps-details.js';
import { createMapsNavigation } from './maps-navigation.js';
import { createMapsNavigationUI } from './maps-navigation-ui.js';

export async function createMapsCore({root,user=null,supabase=null}={}){
 if(!root)throw new Error('Maps Core requires a mount root.');
 const db=supabase||window.KleenestSupabaseClient;
 if(!db?.from)throw new Error('Maps Core requires the canonical Supabase client.');
 let mounted=false,renderer=null,navigationUI=null,refreshPromise=null,lastDiscoveryPosition=null,queuedRefreshPosition=null;
 const state={locations:[],selectedLocationId:null,filters:{},position:null,permission:'unknown',routeStatus:'idle',routeMessage:''};
 const progression=createMapsProgression({progressionCore:window.KleenestProgression||null});
 const location=createMapsLocation({onChange:next=>{if(next.position){state.position=next.position;renderer?.updateUserPosition?.(next.position);if(mounted&&shouldRefreshForPosition(next.position,lastDiscoveryPosition)){if(refreshPromise)queuedRefreshPosition=next.position;else refreshDiscovery({position:next.position,recenter:false}).catch(error=>console.warn('[Maps] location-change refresh failed',error))}}if(next.permission)state.permission=next.permission;}});
 const discovery=createMapsDiscovery({supabase:db});
 const filters=createMapsFilters({supabase:db});
 const cache=createMapsCache({ttlMs:5*60*1000});
 const session=createMapsSession();
 const routing=await createMapsRouting();
 const routes=createMapsRoutes({supabase:db,progression,user,routing});
 const engagement=createMapsEngagement({supabase:db,progression,user,location});
 const verification=createMapsVerification({supabase:db,progression,user});
 const details=createMapsDetails({supabase:db,engagement,verification,routes,social:window.KleenestSocialCore||null});
 const navigation=createMapsNavigation({location,routes,onChange:next=>{renderer?.updateNavigation?.(next);navigationUI?.render(next);}});
 const core={};
 async function ensureLeaflet(){
  if(window.L)return window.L;
  await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.onload=resolve;s.onerror=()=>reject(Error('Leaflet failed to load.'));document.head.appendChild(s)});
  if(!window.L)throw Error('Leaflet failed to initialize.');
  return window.L;
 }
 function routeOrigin(){const p=state.position?.coords||state.position;const lat=Number(p?.latitude),lng=Number(p?.longitude);return Number.isFinite(lat)&&Number.isFinite(lng)?{latitude:lat,longitude:lng}:null}
 function routeStops(){return routes.getStops?.()||[]}
 function renderRoutePanel(){
  let panel=root.querySelector('[data-map-route-panel]');
  if(!panel){panel=document.createElement('section');panel.dataset.mapRoutePanel='1';panel.className='maps-route-card';root.appendChild(panel)}
  const active=routes.getActive?.();const stops=routeStops();
  panel.innerHTML='<div class="maps-route-summary"><strong>'+escapeHtml(active?.name||'My Kleenest Route')+'</strong><span>'+escapeHtml(state.routeMessage||(`${stops.length} stop${stops.length===1?'':'s'}`))+'</span></div><div class="maps-route-actions"><button type="button" data-route-preview>Preview route</button><button type="button" data-route-optimize>Optimize</button><button type="button" class="primary" data-route-start>Start navigation</button><button type="button" data-route-share>Share</button><button type="button" data-route-cancel>Clear</button></div><div class="maps-route-stops">'+(stops.length?stops.map((s,i)=>'<div class="maps-route-stop"><span><strong>'+(i+1)+'. '+escapeHtml(s.locations?.name||s.name||'Kleenest stop')+'</strong><small>'+escapeHtml(s.locations?.address||s.address||'')+'</small></span></div>').join(''):'<span class="maps-route-empty">Add a location from the map or location cards to build a route.</span>')+'</div>';
  panel.querySelector('[data-route-preview]').onclick=()=>previewRoute().catch(showRouteError);
  panel.querySelector('[data-route-optimize]').onclick=()=>optimizeRoute().catch(showRouteError);
  panel.querySelector('[data-route-start]').onclick=()=>startNavigation().catch(showRouteError);
  panel.querySelector('[data-route-share]').onclick=()=>shareRoute().catch(showRouteError);
  panel.querySelector('[data-route-cancel]').onclick=()=>cancelRoute().catch(showRouteError);
  return panel;
 }
 function showRouteError(error){state.routeMessage=error?.message||'Route action failed.';renderRoutePanel()}
 async function refreshDiscovery(opts={}){
  if(refreshPromise)return refreshPromise;
  refreshPromise=(async()=>{
   try{
    const position=opts.position||state.position||location.get().position;
    const effectiveFilters={...state.filters,...(opts.filters||{})};
    if(!position){const cached=cache.isFresh()?cache.get():null;state.locations=Array.isArray(cached)?cached:[]}
    else{state.locations=await discovery.refresh({filters:effectiveFilters,position,radiusMeters:opts.radiusMeters||16093,limit:opts.limit||200});if(!mounted)return state.locations;lastDiscoveryPosition=position;cache.set(state.locations)}
    if(!mounted)return state.locations;
    state.filters=effectiveFilters;
    if(renderer)await renderer.refresh({core,modules:core.modules,state,user},{skipCore:true,recenter:Boolean(opts.recenter)});
    return state.locations;
   }catch(error){
    if(!mounted)return state.locations;
    const cached=cache.isFresh()?cache.get():null;
    if(!Array.isArray(cached))throw error;
    state.locations=cached;
    console.warn('[Maps] discovery failed; using fresh cache',error);
    if(renderer)await renderer.refresh({core,modules:core.modules,state,user},{skipCore:true,recenter:Boolean(opts.recenter)});
    return state.locations;
   }finally{
    const queued=queuedRefreshPosition;queuedRefreshPosition=null;refreshPromise=null;
    if(mounted&&queued&&shouldRefreshForPosition(queued,lastDiscoveryPosition))refreshDiscovery({position:queued,recenter:false}).catch(error=>console.warn('[Maps] queued location refresh failed',error));
   }
  })();
  return refreshPromise;
 }
 async function requestLocationAndRefresh(){try{await location.request()}catch(_){}if(!mounted)return[];const position=location.get().position;state.position=position;await refreshDiscovery({position,recenter:true})}
 async function selectLocation(id){
  if(!mounted)return null;state.selectedLocationId=id;
  const result=await details.open(id,{state,user});if(!mounted)return result;
  try{await engagement.recordVisit?.(id,{source:'maps_detail'})}catch(_){/* visit tracking is non-blocking */}
  let panel=root.querySelector('[data-map-details]');if(!panel){panel=document.createElement('section');panel.dataset.mapDetails='1';panel.className='maps-details-card';root.appendChild(panel)}
  const a=result.actions||{};
  panel.innerHTML='<strong>'+escapeHtml(result.location.name||'Kleenest location')+'</strong><span>'+escapeHtml(result.location.address||result.location.city||'')+'</span><small>'+escapeHtml(result.external?'Public-source location':'Kleenest location')+'</small><div class="maps-details-actions"><button type="button" data-detail-route>Route</button><button type="button" data-detail-checkin>Check in</button><button type="button" data-detail-favorite>Favorite</button><button type="button" data-detail-verify>Verify</button><button type="button" data-detail-share>Share</button></div>';
  const action=async(fn,success)=>{try{const out=await fn?.();state.routeMessage=success;panel.querySelector('small').textContent=success;return out}catch(e){panel.querySelector('small').textContent=e?.message||'Action failed.';return null}};
  panel.querySelector('[data-detail-route]').onclick=()=>openRoute().catch(showRouteError);
  panel.querySelector('[data-detail-checkin]').onclick=()=>action(()=>a.checkIn?.({}),'Check-in recorded');
  panel.querySelector('[data-detail-favorite]').onclick=()=>action(()=>a.favorite?.(true),'Favorite updated');
  panel.querySelector('[data-detail-verify]').onclick=()=>action(()=>a.verify?.({}),'Verification submitted');
  panel.querySelector('[data-detail-share]').onclick=()=>action(()=>a.share?.(),'Shared with the community');
  return result;
 }
 async function previewRoute(){
  const stops=routeStops();if(!stops.length)throw new Error('Add at least one stop before previewing a route.');
  const result=await routes.preview({origin:routeOrigin(),stops});
  navigation.setRouteData(result);renderer?.setRouteGeometry?.(result.geometry);state.routeStatus='preview';state.routeMessage=`${formatDistance(result.distanceMeters)} · ${Math.round(result.durationSeconds/60)} min · ${stops.length} stop${stops.length===1?'':'s'}`;renderRoutePanel();return result;
 }
 async function startNavigation(){
  const active=routes.getActive?.();if(!active||!routeStops().length)throw new Error('Add at least one stop before starting navigation.');
  if(active.status!=='active')await routes.start();
  const result=await previewRoute();navigation.start();state.routeStatus='active';state.routeMessage=`Navigation active · ${routeStops().length} stop${routeStops().length===1?'':'s'}`;renderRoutePanel();return result;
 }
 async function optimizeRoute(){const stops=routeStops();if(stops.length<3)throw new Error('Add at least three stops to optimize a route.');await routes.optimize({origin:routeOrigin()});state.routeMessage='Route order optimized';const result=await previewRoute();return result}
 async function shareRoute(){const active=routes.getActive?.();if(!active)throw new Error('Build a route before sharing it.');const result=await routes.share({source:'maps'});state.routeMessage='Route shared with the community';renderRoutePanel();return result}
 async function cancelRoute(){navigation.stop();await routes.cancel();state.routeStatus='idle';state.routeMessage='Route cleared';renderRoutePanel()}
 async function openRoute(){
  if(!mounted)return null;
  const selected=state.locations.find(x=>String(x.id)===String(state.selectedLocationId));if(!selected)throw new Error('Select a location first.');
  const result=await routes.addLocation(selected.id);state.routeStatus='draft';state.routeMessage=`Added ${selected.name||'location'} to route`;renderRoutePanel();
  try{await previewRoute()}catch(e){state.routeMessage=`Added ${selected.name||'location'} · preview unavailable`;renderRoutePanel();console.warn('[Maps] route preview failed',e)}
  return result;
 }
 function setFilters(next={}){if(!mounted)return Promise.resolve([]);state.filters=filters.apply(next);return refreshDiscovery({filters:state.filters})}
 async function mount(){
  if(mounted)return {destroy};mounted=true;root.replaceChildren();await ensureLeaflet();if(!mounted)return {destroy};
  const controls=document.createElement('section');controls.className='maps-core-controls';controls.innerHTML='<button type="button" data-map-locate>Use my location</button><input data-map-search placeholder="Search nearby places"><select data-map-radius><option value="2">2 mi</option><option value="5">5 mi</option><option value="10" selected>10 mi</option><option value="25">25 mi</option></select><select data-map-type><option value="">All locations</option><option value="restroom">Bathroom verified</option><option value="public">Public data</option></select>';
  const surface=document.createElement('div');surface.className='maps-core-surface';root.append(controls,surface);root.insertAdjacentHTML('afterbegin','<style>.maps-core-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 12px}.maps-core-controls input,.maps-core-controls select,.maps-core-controls button{border:1px solid #cfe0d9;border-radius:10px;background:#fff;padding:10px 12px;font:inherit}.maps-core-controls button{background:#0e7c6b;color:#fff;border:0;font-weight:850;cursor:pointer}.maps-core-surface{min-width:0}</style>');
  renderer=createMapsRenderer();core.modules={location,discovery,cache,filters,session,renderer,routing,routes,progression,engagement,verification,details,navigation};const context={core,modules:core.modules,state,user};await renderer.mount(surface,context);
  if(!mounted){renderer?.destroy?.();renderer=null;return {destroy};}
  controls.querySelector('[data-map-locate]').onclick=()=>requestLocationAndRefresh().catch(console.error);
  controls.querySelector('[data-map-search]').oninput=async e=>{const q=e.target.value.trim();if(!q)return refreshDiscovery();try{state.locations=await discovery.search(q,100);if(!mounted)return;cache.set(state.locations);await renderer.refresh(context,{skipCore:true})}catch(_){if(mounted)refreshDiscovery()}};
  controls.querySelector('[data-map-radius]').onchange=()=>refreshDiscovery({radiusMeters:Number(controls.querySelector('[data-map-radius]').value)*1609.344});
  controls.querySelector('[data-map-type]').onchange=()=>setFilters({placeType:controls.querySelector('[data-map-type]').value||undefined,source:controls.querySelector('[data-map-type]').value==='public'?'osm':undefined,verifiedOnly:false});
  navigationUI=createMapsNavigationUI({root,navigation});location.startWatch();await requestLocationAndRefresh();
  return {destroy};
 }
 function destroy(){if(!mounted)return;mounted=false;navigation.stop();navigationUI?.destroy?.();renderer?.destroy?.();discovery.destroy?.();routes.destroy?.();location.destroy();session.destroy();root.replaceChildren();renderer=null;navigationUI=null;lastDiscoveryPosition=null;queuedRefreshPosition=null;refreshPromise=null}
 Object.assign(core,{name:'maps',version:'5.0.0',mount,destroy,refreshDiscovery,selectLocation,openRoute,previewRoute,startNavigation,optimizeRoute,shareRoute,cancelRoute,setFilters,state,modules:{location,discovery,cache,filters,session,renderer,routing,routes,progression,engagement,verification,details,navigation}});return core;
}
function shouldRefreshForPosition(a,b){if(!a||!b)return true;const lat1=Number(a.coords?.latitude),lon1=Number(a.coords?.longitude),lat2=Number(b.coords?.latitude),lon2=Number(b.coords?.longitude);if(![lat1,lon1,lat2,lon2].every(Number.isFinite))return true;const r=6371000,toRad=v=>v*Math.PI/180,dLat=toRad(lat2-lat1),dLon=toRad(lon2-lon1),h=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;return 2*r*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))>=250}
function formatDistance(m){if(m==null)return'—';if(m<1000)return`${Math.round(m)} m`;return`${(m/1000).toFixed(1)} km`}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}