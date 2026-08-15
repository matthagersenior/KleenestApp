/* Modular Maps engagement bridge v2. Uses the authoritative shared Supabase client so Favorites and Check-ins inherit the real auth session. */
(function(global){'use strict';
if(global.__KLEENEST_MAP_ENGAGEMENT_V2__)return;global.__KLEENEST_MAP_ENGAGEMENT_V2__=true;
const URL='https://ssgesjzdvdsqacdtasje.supabase.co',KEY='sb_publishable_f1rbczgvWKSQy2g9mTDQZg_K9Wv19bL';
function fallbackToken(){try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'';if(!k.includes('auth-token'))continue;const raw=localStorage.getItem(k);if(!raw)continue;const j=JSON.parse(raw);const a=j?.access_token||j?.currentSession?.access_token;if(a)return a}}catch(_){}return null}
async function rpc(name,args){
  if(global.KleenestSupabase?.rpc)return global.KleenestSupabase.rpc(name,args||{});
  const token=fallbackToken();if(!token)throw Error('Please sign in to use this action.');
  const r=await fetch(URL+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(args||{})});
  if(!r.ok)throw Error(await r.text());return r.json();
}
async function select(path){
  if(global.KleenestSupabase?.getClient){const {data,error}=await global.KleenestSupabase.getClient().from(path.split('?')[0]).select(path.includes('?')?path.split('?')[1].replace(/^select=/,''):'*');if(error)throw error;return data||[]}
  const token=fallbackToken();if(!token)return [];
  const r=await fetch(URL+'/rest/v1/'+path,{headers:{apikey:KEY,Authorization:'Bearer '+token}});if(!r.ok)throw Error(await r.text());return r.json();
}
async function hydrate(){try{const favs=await select('favorites?select=location_id');const checks=await select('check_ins?select=location_id&order=checked_in_at.desc&limit=200');global.KleenestMapsEngagement={favorites:new Set((favs||[]).map(x=>String(x.location_id))),checkIns:new Set((checks||[]).map(x=>String(x.location_id)))};global.dispatchEvent(new CustomEvent('kleenest:map-engagement-ready',{detail:global.KleenestMapsEngagement}))}catch(e){console.warn('[Kleenest] engagement hydrate failed',e)}}
global.addEventListener('kleenest:map-favorite',async e=>{const x=e.detail?.location;if(!x?.id)return;try{const r=await rpc('kleenest_toggle_favorite',{p_location_id:x.id});if(r?.favorite===false||r?.favorite===true){localStorage.setItem('kleenest.favorite.location.'+x.id,r.favorite?'1':'0');(global.KleenestMapsEngagement||(global.KleenestMapsEngagement={})).favorites=global.KleenestMapsEngagement.favorites||new Set();r.favorite?global.KleenestMapsEngagement.favorites.add(String(x.id)):global.KleenestMapsEngagement.favorites.delete(String(x.id));global.dispatchEvent(new CustomEvent('kleenest:map-favorite-result',{detail:{location:x,favorite:r.favorite}}))}}catch(err){console.warn('[Kleenest] favorite sync failed',err);global.dispatchEvent(new CustomEvent('kleenest:action-error',{detail:{action:'favorite',location:x,error:err}}))}});
global.addEventListener('kleenest:map-checkin',async e=>{const x=e.detail?.location;if(!x?.id||e.detail.checked!==true)return;try{const loc=global.KleenestMapBrowserLocation||global.KleenestMapCache?.user||null;const r=await rpc('kleenest_map_check_in',{p_location_id:x.id,p_lat:loc?.lat??null,p_lng:loc?.lng??null});if(r?.success){localStorage.setItem('kleenest.checkin.location.'+x.id,'1');(global.KleenestMapsEngagement||(global.KleenestMapsEngagement={})).checkIns=global.KleenestMapsEngagement.checkIns||new Set();global.KleenestMapsEngagement.checkIns.add(String(x.id));global.dispatchEvent(new CustomEvent('kleenest:points-earned',{detail:{location:x,points:r.points_awarded||0,reason:'map_check_in'}}))}}catch(err){console.warn('[Kleenest] check-in sync failed',err)}});
global.addEventListener('kleenest:map-location-view',async e=>{const id=e.detail?.location?.id;if(!id)return;try{await rpc('kleenest_map_view',{p_location_id:id})}catch(err){console.warn('[Kleenest] location view sync failed',err)}});
function ready(){hydrate();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
global.KleenestMapEngagement={hydrate,rpc,select};
})(window);