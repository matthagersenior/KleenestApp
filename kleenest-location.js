/* Kleenest location controller. */
(function(){'use strict';
  const api=window.KleenestLocation=window.KleenestLocation||{};
  let current=null;
  function emit(name,detail){window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}));}
  function valid(latitude,longitude){return Number.isFinite(latitude)&&Number.isFinite(longitude)&&latitude>=-90&&latitude<=90&&longitude>=-180&&longitude<=180;}
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
  function get(){return current;}
  function validate(latitude,longitude){return valid(Number(latitude),Number(longitude));}
  api.getCurrentPosition=getCurrentPosition;api.get=get;api.validate=validate;
  window.KleenestUI=window.KleenestUI||{};window.KleenestUI.getCurrentLocation=getCurrentPosition;
})();