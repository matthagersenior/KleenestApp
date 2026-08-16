/* Maps Location Module: GPS/session state without blocking the app shell. */
export function createMapsLocation({ onChange = () => {} } = {}) {
  let watchId = null, position = null, permission = 'unknown';
  async function request() {
    if (!navigator.geolocation) { permission='unsupported'; onChange({permission}); return null; }
    return new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(p=>{position=p;permission='granted';onChange({position,permission});resolve(p)},e=>{permission=e.code===1?'denied':'error';onChange({permission,error:e});reject(e)},{enableHighAccuracy:true,maximumAge:30000,timeout:15000}));
  }
  function startWatch(){ if(watchId!=null)return; if(!navigator.geolocation)return; watchId=navigator.geolocation.watchPosition(p=>{position=p;permission='granted';onChange({position,permission})},e=>{permission=e.code===1?'denied':'error';onChange({permission,error:e})},{enableHighAccuracy:true,maximumAge:15000,timeout:15000}); }
  function stopWatch(){if(watchId!=null){navigator.geolocation.clearWatch(watchId);watchId=null}}
  function get(){return {position,permission}}
  function destroy(){stopWatch();position=null}
  return Object.freeze({request,startWatch,stopWatch,get,destroy});
}