/* Kleenest location controller. */
(function(){'use strict';
  const api=window.KleenestLocation=window.KleenestLocation||{};
  let current=null;
  function emit(name,detail){window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}));}
  function valid(latitude,longitude){return Number.isFinite(latitude)&&Number.isFinite(longitude)&&latitude>=-90&&latitude<=90&&longitude>=-180&&longitude<=180;}
  function ensureDiscovery(){
    if(window.KleenestMapDiscovery?.load){window.KleenestMapDiscovery.load('location-ready').catch(e=>console.warn('[Kleenest] map discovery',e));return;}
    if(document.querySelector('script[data-kleenest-map-discovery]'))return;
    const s=document.createElement('script');s.src='kleenest-map-discovery-bootstrap.js';s.async=false;s.dataset.kleenestMapDiscovery='true';s.onload=()=>window.KleenestMapDiscovery?.load?.('location-ready');s.onerror=()=>console.warn('[Kleenest] map discovery bootstrap failed');document.head.appendChild(s);
  }
  async function getCurrentPosition(options){
    if(!navigator.geolocation)throw new Error('Geolocation is not available in this browser.');
    const opts=Object.assign({enableHighAccuracy:true,timeout:10000,maximumAge:60000},options||{});
    return new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(position=>{
      const latitude=position.coords.latitude,longitude=position.coords.longitude;
      if(!valid(latitude,longitude)){const error=new Error('Invalid coordinates returned by the location service.');emit('kleenest:location-error',{error});reject(error);return;}
      current={latitude,longitude,lat:latitude,lng:longitude,accuracy:position.coords.accuracy,timestamp:position.timestamp};
      emit('kleenest:location-updated',{location:current});
      ensureDiscovery();resolve(current);
    },error=>{const detail={code:error.code,message:error.message,error};emit('kleenest:location-error',detail);reject(error);},opts));
  }
  async function request(options){return getCurrentPosition(Object.assign({enableHighAccuracy:true,timeout:12000,maximumAge:300000},options||{}));}
  function get(){return current;}
  function validate(latitude,longitude){return valid(Number(latitude),Number(longitude));}
  api.getCurrentPosition=getCurrentPosition;api.request=request;api.get=get;api.validate=validate;api.ensureDiscovery=ensureDiscovery;
  window.KleenestUI=window.KleenestUI||{};window.KleenestUI.getCurrentLocation=getCurrentPosition;
  setTimeout(()=>{const cached=api.get()||window.KleenestRuntime?.location||window.KleenestRuntime?.userLocation||((typeof state!=='undefined')?state.location:null);if(cached)ensureDiscovery();},0);
})();