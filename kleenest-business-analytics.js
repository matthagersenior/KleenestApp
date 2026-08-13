/* Kleenest Business Analytics — preferred program reporting bridge. */
(function(){
  'use strict';
  async function rpc(name, params){
    const client=window.kleenestSupabase;
    if(!client) throw new Error('Supabase client unavailable');
    const {data,error}=await client.rpc(name,params||{});
    if(error) throw error;
    return data;
  }
  window.kleenestBusinessAnalytics={
    async preferredSummary(){ return rpc('business_preferred_location_summary'); },
    async preferredUsage(locationId){ return rpc('business_preferred_location_usage',{p_location_id:locationId}); },
    async programUsage(programId){ return rpc('business_partner_program_usage',{p_partner_program_id:programId}); }
  };
})();
