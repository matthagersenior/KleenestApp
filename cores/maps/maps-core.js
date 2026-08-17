/* Kleenest Maps Core — authoritative modular Maps surface. */
const DEFAULT_MODULES=Object.freeze(['location','discovery','cache','session','catalog','verification','engagement','details','filters','renderer','routes','progression','social','business']);

export function createMapsCore({supabase,root,user=null,modules={}}={}){
  if(!root)throw new Error('Maps Core requires a mount root.');
  const state={user,destroyed:false,ready:false,modules:Object.freeze({...modules}),selectedLocationId:null,filters:{},locations:[],status:'initializing',rendererRoot:null,navigation:null};
  const missing=DEFAULT_MODULES.filter(function(name){return !state.modules[name]});
  let unsubscribeLocation=null;

  function contract(){return Object.freeze({version:'1.7.2',core:'maps',modules:DEFAULT_MODULES.slice(),required:DEFAULT_MODULES.slice(),missing:missing.slice()})}
  function context(){return {supabase:supabase,user:state.user,state:state,modules:state.modules,core:api}}
  function setStatus(text){const el=root.querySelector('[data-maps-status]');if(el)el.textContent=text}

  async function refreshDiscovery(){
    const position=state.modules.location&&state.modules.location.get?((state.modules.location.get()||{}).position||null):null;
    let locations=[];
    const cached=state.modules.cache&&state.modules.cache.get?state.modules.cache.get()||[]:[];
    if(state.modules.cache&&state.modules.cache.isFresh&&state.modules.cache.isFresh())locations=cached;
    try{
      if(!state.modules.discovery||!state.modules.discovery.refresh)throw new Error('Maps discovery module is unavailable.');
      locations=await state.modules.discovery.refresh({filters:state.filters,user:state.user,position:position});
      if(state.modules.cache&&state.modules.cache.set)state.modules.cache.set(locations);
    }catch(error){
      if(!locations.length)throw error;
      console.warn('[Maps] using cached discovery',error);
    }
    state.locations=Array.isArray(locations)?locations:[];
    return state.locations;
  }

  async function initialize(){
    if(state.destroyed)return;
    state.status='initializing';
    root.replaceChildren();
    root.innerHTML='<section class="maps-core" data-maps-core>'+
      '<div class="maps-core__hero">'+
        '<span class="maps-core__eyebrow">KLEENEST MAPS</span>'+
        '<h1>Find, verify, route and earn.</h1>'+
        '<p>Discover clean places, build routes, check in, verify locations and turn every meaningful action into progression.</p>'+
        '<div class="maps-core__quick">'+
          '<button type="button" data-map-action="locate">Use my location</button>'+
          '<button type="button" data-map-action="route">Plan a route</button>'+
          '<button type="button" data-map-action="refresh">Refresh</button>'+
        '</div>'+
      '</div>'+
      '<div class="maps-core__status" data-maps-status>Preparing your map…</div>'+
      '<div class="maps-core__filters" data-maps-filters>'+
        '<button data-filter="all">All</button><button data-filter="verified">Verified</button>'+
        '<button data-filter="restroom">Restrooms</button><button data-filter="gas_station">Gas</button>'+
        '<button data-filter="cafe">Cafes</button><button data-filter="park">Parks</button><button data-filter="hospital">Hospitals</button>'+
      '</div>'+ '<div class="maps-core__surface" data-maps-surface></div>'+ '<div class="maps-core__details" data-maps-details></div>'+
      '<div class="maps-core__progression" data-maps-progression><strong>Maps progression</strong><span>Check-ins, verification, routes and community actions contribute to your progression.</span></div>'+
    '</section>';

    if(missing.length){
      state.status='configuration_error';
      setStatus('Maps Core is missing modules: '+missing.join(', ')+'.');
      return;
    }

    state.rendererRoot=root.querySelector('[data-maps-surface]');
    const ctx=context();
    for(const name of DEFAULT_MODULES){
      const mod=state.modules[name];
      if(mod&&typeof mod.initialize==='function')await mod.initialize(ctx);
    }

    if(state.modules.location&&state.modules.location.subscribe){
      unsubscribeLocation=state.modules.location.subscribe(async function(change){
        if(state.destroyed||!change||!change.position||state.status!=='ready')return;
        try{
          await refreshDiscovery();
          updateStatus();
          if(state.modules.renderer&&state.modules.renderer.refresh)await state.modules.renderer.refresh(context());
          if(state.modules.renderer&&state.modules.renderer.updateUserPosition)state.modules.renderer.updateUserPosition(change.position);
          if(state.navigation&&state.navigation.update)await state.navigation.update(change.position);
        }catch(error){console.warn('[Maps] live GPS refresh failed',error)}
      });
    }

    try{
      if(state.modules.location&&state.modules.location.request)await state.modules.location.request();
      if(state.modules.location&&state.modules.location.startWatch)state.modules.location.startWatch();
    }catch(_){ }
    try{await refreshDiscovery()}catch(error){console.warn('[Maps] discovery unavailable',error)}

    state.ready=true;
    state.status='ready';
    updateStatus();
    bindActions();
    if(state.modules.renderer&&typeof state.modules.renderer.mount==='function')await state.modules.renderer.mount(state.rendererRoot,ctx);
    renderDetails();
  }

  function updateStatus(){setStatus(state.locations.length?String(state.locations.length)+' nearby locations ready.':'Map ready — searching for nearby locations…')}
  function showActionError(error){console.error('[Maps action]',error);setStatus(error&&error.message?error.message:'That Maps action could not be completed.')}

  function bindActions(){
    const locate=root.querySelector('[data-map-action="locate"]');
    const refresh=root.querySelector('[data-map-action="refresh"]');
    const route=root.querySelector('[data-map-action="route"]');
    if(locate)locate.onclick=async function(){try{const p=await state.modules.location.request();if(state.modules.renderer&&state.modules.renderer.updateUserPosition)state.modules.renderer.updateUserPosition(p);await refreshDiscovery();updateStatus();if(state.modules.renderer&&state.modules.renderer.refresh)await state.modules.renderer.refresh(context())}catch(e){showActionError(e)}};
    if(refresh)refresh.onclick=async function(){try{await refreshDiscovery();updateStatus();if(state.modules.renderer&&state.modules.renderer.refresh)await state.modules.renderer.refresh(context())}catch(e){showActionError(e)}};
    if(route)route.onclick=openRoute;
    root.querySelectorAll('[data-filter]').forEach(function(button){button.onclick=async function(){const value=button.dataset.filter;state.filters=value==='all'?{}:value==='verified'?{verifiedOnly:true}:{placeType:value};if(state.modules.filters&&state.modules.filters.apply)state.modules.filters.apply(state.filters,{state:state});try{await refreshDiscovery();updateStatus();if(state.modules.renderer&&state.modules.renderer.refresh)await state.modules.renderer.refresh(context())}catch(e){showActionError(e)}}});
  }

  async function selectLocation(locationId){
    if(!state.ready)throw new Error('Maps Core is not ready.');
    state.selectedLocationId=locationId;
    const result=state.modules.details&&state.modules.details.open?await state.modules.details.open(locationId,{state:state,user:state.user}):null;
    renderDetails(result);
    return result;
  }

  function renderDetails(result){
    const el=root.querySelector('[data-maps-details]');
    if(!el)return;
    if(!result){el.innerHTML='<div class="maps-details-card"><strong>Explore the map</strong><span>Select a location to see verification, check-in, favorite, route and community actions.</span></div>';return;}
    const location=result.location||{};
    el.innerHTML='<div class="maps-details-card"><div><strong>'+escapeHtml(location.name||location.title||'Location')+'</strong><span>'+escapeHtml(location.address||location.description||'Community location')+'</span></div><div class="maps-details-actions"><button data-detail="checkin">Check in</button><button data-detail="favorite">Favorite</button><button data-detail="route">Add to route</button><button data-detail="community-verify">Community verify</button><button data-detail="trusted-verify">Trusted verify</button></div></div>';
    const checkin=el.querySelector('[data-detail="checkin"]');
    const favorite=el.querySelector('[data-detail="favorite"]');
    const route=el.querySelector('[data-detail="route"]');
    const community=el.querySelector('[data-detail="community-verify"]');
    const trusted=el.querySelector('[data-detail="trusted-verify"]');
    if(checkin&&result.actions&&result.actions.checkIn)checkin.onclick=function(){return result.actions.checkIn().catch(showActionError)};
    if(favorite&&result.actions&&result.actions.favorite)favorite.onclick=function(){return result.actions.favorite(true).catch(showActionError)};
    if(route&&result.actions&&result.actions.addToRoute)route.onclick=function(){return result.actions.addToRoute().catch(showActionError)};
    const position=state.modules.location&&state.modules.location.get?((state.modules.location.get()||{}).position||null):null;
    const evidence=position&&position.coords?{lat:position.coords.latitude,lng:position.coords.longitude}:{};
    if(community&&state.modules.verification&&state.modules.verification.community)community.onclick=function(){return state.modules.verification.community({locationId:state.selectedLocationId,evidence:evidence}).catch(showActionError)};
    if(trusted&&state.modules.verification&&state.modules.verification.trusted)trusted.onclick=function(){return state.modules.verification.trusted({locationId:state.selectedLocationId,evidence:evidence}).catch(showActionError)};
  }

  async function openRoute(){
    const el=root.querySelector('[data-maps-details]');
    if(!el)return;
    const routes=state.modules.routes;
    if(!routes)throw new Error('Maps routes module is unavailable.');
    el.innerHTML='<div class="maps-details-card maps-route-card"><strong>Route planner</strong><span>Build a route from locations you discover on the map.</span><div class="maps-details-actions"><button data-route="create">Create route</button><button data-route="history">Route history</button><button data-route="active">Active route</button><button data-route="preview">Preview</button><button data-route="optimize">Optimize</button><button data-route="start">Start navigation</button><button data-route="complete">Complete route</button><button data-route="share">Share</button><button data-route="cancel">Cancel</button></div><div class="maps-route-summary" data-route-summary></div><div class="maps-route-stops" data-route-stops></div></div>';
    const stopsEl=el.querySelector('[data-route-stops]');
    const summary=el.querySelector('[data-route-summary]');
    const paintStops=function(){
      const stops=routes.getStops?routes.getStops()||[]:[];
      let html='';
      if(stops.length){html='<strong>Stops</strong>'+stops.map(function(stop,index){const id=escapeHtml(String(stop.id));const name=escapeHtml(stop.name||(stop.locations&&stop.locations.name)||stop.location_name||stop.location_id||'Location');return '<div class="maps-route-stop"><span>'+String(index+1)+'. '+name+'</span><button type="button" data-stop-complete="'+id+'">Complete</button></div>'}).join('');}
      else html='<span>No stops yet. Add locations from the map details or marker popups.</span>';
      stopsEl.innerHTML=html;
      stopsEl.querySelectorAll('[data-stop-complete]').forEach(function(button){button.onclick=function(){return routes.completeStop(button.dataset.stopComplete).then(paintStops).catch(showActionError)}});
    };
    const create=el.querySelector('[data-route="create"]');
    const history=el.querySelector('[data-route="history"]');
    const active=el.querySelector('[data-route="active"]');
    const preview=el.querySelector('[data-route="preview"]');
    const optimize=el.querySelector('[data-route="optimize"]');
    const start=el.querySelector('[data-route="start"]');
    const complete=el.querySelector('[data-route="complete"]');
    const share=el.querySelector('[data-route="share"]');
    const cancel=el.querySelector('[data-route="cancel"]');
    if(create)create.onclick=async function(){try{const r=await routes.create();summary.textContent='Draft route: '+(r.name||'My Kleenest Route');paintStops()}catch(e){showActionError(e)}};
    if(history)history.onclick=async function(){try{const rows=await routes.listMine();summary.textContent=String(rows.length)+' saved route'+(rows.length===1?'':'s')+'.';paintStops()}catch(e){showActionError(e)}};
    if(active)active.onclick=function(){const r=routes.getActive?routes.getActive():null;summary.textContent=r?'Active route: '+(r.name||r.id):'No active route.';paintStops()};
    if(preview)preview.onclick=function(){return routes.preview().then(function(r){const distance=Number(r.distanceMeters||0)/1609.344;const duration=Math.round(Number(r.durationSeconds||0)/60);summary.textContent='Preview: '+distance.toFixed(1)+' mi · '+duration+' min · '+String((r.steps||[]).length)+' maneuvers';paintStops();if(state.modules.renderer&&state.modules.renderer.setRouteGeometry)state.modules.renderer.setRouteGeometry(r.geometry);if(state.navigation&&state.navigation.setRouteData)state.navigation.setRouteData(r);if(state.modules.renderer&&state.modules.renderer.updateNavigation)state.modules.renderer.updateNavigation({active:true,routeData:r,maneuver:{step:r.steps&&r.steps[0],distanceMeters:r.steps&&r.steps[0]?r.steps[0].distance:null},progress:0,completedStops:0,totalStops:routes.getStops?routes.getStops().length:0})}).catch(showActionError)};
    if(optimize)optimize.onclick=function(){return routes.optimize().then(function(){summary.textContent='Stops optimized for route order.';paintStops()}).catch(showActionError)};
    if(start)start.onclick=function(){return routes.start().then(function(){summary.textContent='Navigation started. Keep Kleenest open while traveling.';if(state.navigation&&state.navigation.start)state.navigation.start()}).catch(showActionError)};
    if(complete)complete.onclick=function(){return routes.complete().then(function(){summary.textContent='Route completed — progression recorded.';if(state.navigation&&state.navigation.stop)state.navigation.stop()}).catch(showActionError)};
    if(share)share.onclick=function(){return routes.share({source:'maps'}).then(function(){summary.textContent='Route shared.'}).catch(showActionError)};
    if(cancel)cancel.onclick=function(){return routes.cancel().then(function(){summary.textContent='Route cancelled.';if(state.navigation&&state.navigation.stop)state.navigation.stop()}).catch(showActionError)};
    paintStops();
  }

  function setFilters(filters={}){state.filters={...filters};if(state.modules.filters&&state.modules.filters.apply)state.modules.filters.apply(state.filters,{state:state});return refreshDiscovery()}
  function setNavigation(navigation){state.navigation=navigation;state.modules.navigation=navigation;return navigation}
  function destroy(){if(state.destroyed)return;if(unsubscribeLocation)unsubscribeLocation();if(state.navigation&&state.navigation.stop)state.navigation.stop();const ctx=context();for(const name of DEFAULT_MODULES.slice().reverse()){try{if(state.modules[name]&&state.modules[name].destroy)state.modules[name].destroy(ctx)}catch(error){console.error('[Maps Core] '+name+' destroy failed',error)}}state.destroyed=true;root.replaceChildren()}
  const api=Object.freeze({contract:contract,initialize:initialize,refresh:refreshDiscovery,refreshDiscovery:refreshDiscovery,selectLocation:selectLocation,setFilters:setFilters,openRoute:openRoute,setNavigation:setNavigation,destroy:destroy,get state(){return {...state,modules:undefined}}});
  return api;
}

function escapeHtml(value){const map={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};return String(value==null?'':value).replace(/[&<>"']/g,function(character){return map[character]})}
