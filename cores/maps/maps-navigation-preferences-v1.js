/* Maps navigation preferences — device-local choice, no personal location data. */
const KEY='kleenest.navigation.preference.v1';
const OPTIONS=Object.freeze(['kleenest','ask','google','apple','waze','bing','here','osm']);
export function createMapsNavigationPreferences({storage=null}={}){
  const store=storage||(()=>{try{return window.localStorage}catch(_){return null}})();
  function read(){try{const value=store?.getItem(KEY);return OPTIONS.includes(value)?value:'kleenest'}catch(_){return'kleenest'}}
  function set(provider){if(!OPTIONS.includes(provider))throw new Error('Unsupported navigation provider.');try{store?.setItem(KEY,provider)}catch(_){};return provider}
  function clear(){try{store?.removeItem(KEY)}catch(_){};return'kleenest'}
  return Object.freeze({get:read,set,clear,options:()=>OPTIONS.slice()});
}
export function navigationProviderLabel(provider){return({kleenest:'Kleenest',ask:'Ask every time',google:'Google Maps',apple:'Apple Maps',waze:'Waze',bing:'Bing Maps',here:'HERE WeGo',osm:'OpenStreetMap'})[provider]||'Kleenest'}
export function buildExternalNavigationUrls({provider='kleenest',latitude,longitude,label='Destination'}={}){
  const lat=Number(latitude),lng=Number(longitude),name=encodeURIComponent(label||'Destination');
  if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;
  const destination=`${lat},${lng}`;
  return {
    google:`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
    apple:`https://maps.apple.com/?daddr=${encodeURIComponent(destination)}`,
    waze:`https://www.waze.com/ul?ll=${encodeURIComponent(destination)}&navigate=yes`,
    bing:`https://www.bing.com/maps?rtp=adr.${name}_${encodeURIComponent(destination)}`,
    here:`https://wego.here.com/directions/mix/${encodeURIComponent(destination)}`,
    osm:`https://www.openstreetmap.org/directions?to=${encodeURIComponent(destination)}`
  }[provider]||null;
}
