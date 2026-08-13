/* Kleenest location controller. */
(function(){'use strict';
  const api=window.KleenestLocation=window.KleenestLocation||{};
  let current=null;
  function emit(name,detail){window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}));}
  function valid(latitude,longitude){return Number.isFinite(latitude)&&Number.isFinite(longitude)&&latitude>=-90&&latitude<=90&&longitude>=-180&&longitude<=180;}
  function distanceMiles(lat1,lng1,lat2,lng2){const R=3958.7613,toRad=v=>v*Math.PI/180,dLat=toRad(lat2-lat1),dLng=toRad(lng2-lng1),a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
  async function getCurrentPosition(options){
    if(!navigator.geolocation)throw new Error('Geolocation is not available in this browser.');
    const opts=Object.assign({enableHighAccuracy:true,timeout:10000,maximumAge:60000},options||{});
    return new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(position=>{
      const latitude=position.coords.latitude,longitude=position.coords.longitude;
      if(!valid(latitude,longitude)){const error=new Error('Invalid coordinates returned by the location service.');emit('kleenest:location-error',{error});reject(error);return;}
      current={latitude,longitude,accuracy:position.coords.accuracy,timestamp:position.timestamp};
      emit('kleenest:location-updated',{location:current});resolve(current);
    },error=>{const detail={code:error.code,message:error.message,error};emit('kleenest:location-error',detail);reject(error);},opts));
  }
  async function checkGeofence(restroom,options){
    if(!restroom)throw new Error('A restroom is required.');
    try{const position=await getCurrentPosition(Object.assign({timeout:8000},options||{}));const dist=distanceMiles(position.latitude,position.longitude,Number(restroom.lat),Number(restroom.lng));const radiusMi=((restroom.geofence?.radiusM)||45)/1609.34;return {ok:true,inside:dist<=radiusMi,distMiles:dist,location:position};}
    catch(error){return {ok:false,reason:error?.message||'Unable to determine your location.',error};}
  }
  function get(){return current;}
  function validate(latitude,longitude){return valid(Number(latitude),Number(longitude));}
  api.getCurrentPosition=getCurrentPosition;api.checkGeofence=checkGeofence;api.get=get;api.validate=validate;
  window.KleenestUI=window.KleenestUI||{};window.KleenestUI.getCurrentLocation=getCurrentPosition;window.KleenestUI.checkGeofence=checkGeofence;
})();