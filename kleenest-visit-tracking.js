/* Kleenest Visit Tracking — authoritative real-visit integration point. */
(function(){
  'use strict';
  async function record(locationId, context){
    if(!locationId || !window.kleenestSupabase) return {ok:false,reason:'unavailable'};
    try {
      const {data,error}=await window.kleenestSupabase.rpc('record_location_visit',{p_location_id:locationId,p_context:context||{}});
      if(error) throw error;
      // record_location_visit already increments Preferred usage atomically when applicable.
      return {ok:true,data};
    } catch(e){
      console.warn('[Kleenest] visit tracking unavailable:',e?.message||e);
      return {ok:false,reason:'tracking_failed'};
    }
  }
  window.kleenestVisitTracking={record};
})();
