/* Kleenest Maps Core v4 — the single lifecycle owner of the Maps tab. Supporting modules are subordinate to this core. */
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
 let mounted=false,renderer=null,navigationUI=null,refreshInFlight=false,lastDiscoveryPosition=null;
 const state={locations:[],selectedLocationId:null,filters:{},position:null,permission:'unknown'};
 const progression=createMapsProgression({progressionCore:window.KleenestProgression||null});
 const location=createMapsLocation({onChange:next=>{if(next.position){state.position=next.position;renderer?.updateUserPosition?.(next.position);if(mounted&&!refreshInFlight&&shouldRefreshForPosition(next.position,lastDiscoveryPosition)){refreshDiscovery({position:next.position,recenter:false}).catch(error=>console.warn('[Maps] location-change refresh failed',error))}}if(next.permission)state.permission=next.permission;}});
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
 async function refreshDiscovery(opts={}){
  if(refreshInFlight)return state.locations;
  refreshInFlight=true;
  try{
   const position=opts.position||state.position||location.get().position;
   const effectiveFilters={...state.filters,...(opts.filters||{})};
   state.locations=await discovery.refresh({filters:effectiveFilters,position,radiusMeters:opts.radiusMeters||16093,limit:opts.limit||200});
   state.filters=effectiveFilters;
   if(position)lastDiscoveryPosition=position;
   cache.set(state.locations);
   if(renderer)await renderer.refresh({core,modules:core.modules,state,user},{skipCore:true,recenter:Boolean(opts.recenter)});
   return state.locations;
  }catch(error){
   const cached=cache.isFresh()?cache.get():null;
   if(!Array.isArray(cached))throw error;
   state.locations=cached;
   console.warn('[Maps] discovery failed; using fresh cache',error);
   if(renderer)await renderer.refresh({core,modules:core.modules,state,user},{skipCore:true,recenter:Boolean(opts.recenter)});
   return state.locations;
  }finally{refreshInFlight=false}
 }
 async function requestLocationAndRefresh(){
  try{await location.request()}catch(_){}
  const position=location.get().position;
  state.position=position;
  await refreshDiscovery({position,recenter:true});
 }
 async function selectLocation(id){
  state.selectedLocationId=id;
  const result=await details.open(id,{state,user});
  let panel=root.querySelector('[data-map-details]');
  if(!panel){panel=document.createElement('section');panel.dataset.mapDetails='1';panel.className='maps-details-card';root.appendChild(panel)}
  panel.innerHTML='<strong>'+escapeHtml(result.location.name||'Kleenest location')+'</strong><span>'+escapeHtml(result.location.address||result.location.city||'')+'</span><small>'+escapeHtml(result.external?'Public-source location':'Kleenest location')+'</small>';
  return result;
 }
 async function openRoute(){
  const selected=state.locations.find(x=>String(x.id)===String(state.selectedLocationId));
  if(!selected)return null;
  try{await routes.addLocation(selected.id);return routes.getActive()}catch(e){console.warn('[Maps] route action failed',e);return null}
 }
 function setFilters(next={}){state.filters=filters.apply(next);return refreshDiscovery({filters:state.filters});}
 async function mount(){
  if(mounted)return {destroy};
  mounted=true;
  root.replaceChildren();
  await ensureLeaflet();
  const controls=document.createElement('section');
  controls.className='maps-core-controls';
  controls.innerHTML='<button type="button" data-map-locate>Use my location</button><input data-map-search placeholder="Search nearby places"><select data-map-radius><option value="2">2 mi</option><option value="5">5 mi</option><option value="10" selected>10 mi</option><option value="25">25 mi</option></select><select data-map-type><option value="">All locations</option><option value="restroom">Bathroom verified</option><option value="public">Public data</option></select>';
  const surface=document.createElement('div');surface.className='maps-core-surface';
  root.append(controls,surface);
  root.insertAdjacentHTML('afterbegin','<style>.maps-core-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:0 0 12px}.maps-core-controls input,.maps-core-controls select,.maps-core-controls button{border:1px solid #cfe0d9;border-radius:10px;background:#fff;padding:10px 12px;font:inherit}.maps-core-controls button{background:#0e7c6b;color:#fff;border:0;font-weight:850;cursor:pointer}.maps-core-surface{min-width:0}</style>');
  renderer=createMapsRenderer();
  core.modules={location,discovery,cache,filters,session,renderer,routing,routes,progression,engagement,verification,details,navigation};
  const context={core,modules:core.modules,state,user};
  await renderer.mount(surface,context);
  controls.querySelector('[data-map-locate]').onclick=()=>requestLocationAndRefresh().catch(console.error);
  controls.querySelector('[data-map-search]').oninput=async e=>{const q=e.target.value.trim();if(!q)return refreshDiscovery();try{state.locations=await discovery.search(q,100);cache.set(state.locations);await renderer.refresh(context,{skipCore:true})}catch(_){refreshDiscovery()}};
  controls.querySelector('[data-map-radius]').onchange=()=>refreshDiscovery({radiusMeters:Number(controls.querySelector('[data-map-radius]').value)*1609.344});
  controls.querySelector('[data-map-type]').onchange=()=>setFilters({placeType:controls.querySelector('[data-map-type]').value||undefined});
  navigationUI=createMapsNavigationUI({root,navigation});
  location.startWatch();
  await requestLocationAndRefresh();
  return {destroy};
 }
 function destroy(){if(!mounted)return;mounted=false;navigation.stop();navigationUI?.destroy?.();renderer?.destroy?.();routes.destroy?.();location.destroy();session.destroy();root.replaceChildren();renderer=null;navigationUI=null;lastDiscoveryPosition=null}
 Object.assign(core,{name:'maps',version:'4.0.0',mount,destroy,refreshDiscovery,selectLocation,openRoute,setFilters,state,modules:{location,discovery,cache,filters,session,renderer,routing,routes,progression,engagement,verification,details,navigation}});
 return Object.freeze(core);
}
function shouldRefreshForPosition(next,previous){const lat=Number(next?.coords?.latitude),lng=Number(next?.coords?.longitude),prevLat=Number(previous?.coords?.latitude),prevLng=Number(previous?.coords?.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lng))return false;if(!Number.isFinite(prevLat)||!Number.isFinite(prevLng))return true;return haversineMeters(lat,lng,prevLat,prevLng)>=250}
function haversineMeters(lat1,lon1,lat2,lon2){const r=6371000,toRad=v=>v*Math.PI/180,dLat=toRad(lat2-lat1),dLon=toRad(lon2-lon1),a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;return 2*r*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))}
function escapeHtml(v){return String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}