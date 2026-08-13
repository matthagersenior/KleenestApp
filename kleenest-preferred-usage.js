/* Preferred usage bridge: records real user activity against the authorized activation. */
(function(){'use strict';
 async function record(activationId,eventType,metadata){
  if(!window.KleenestSupabase?.client)throw new Error('Supabase is not ready.');
  const {data,error}=await window.KleenestSupabase.client().rpc('record_preferred_usage',{p_activation_id:activationId,p_event_type:eventType,p_metadata:metadata||{}});
  if(error)throw error;return data;
 }
 async function analytics(businessId){
  if(!window.KleenestSupabase?.client)throw new Error('Supabase is not ready.');
  let q=window.KleenestSupabase.client().from('preferred_business_analytics').select('*').order('day',{ascending:false});
  if(businessId)q=q.eq('business_id',businessId);
  const {data,error}=await q;if(error)throw error;return data||[];
 }
 window.kleenestPreferredUsage={record,analytics};
})();
