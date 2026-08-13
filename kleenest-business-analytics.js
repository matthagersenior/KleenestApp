/* Kleenest Business Analytics — preferred program reporting bridge. */
(function(){
 'use strict';
 async function rpc(name,params){
  const client=window.kleenestSupabase;
  if(!client) throw new Error('Supabase client unavailable');
  const {data,error}=await client.rpc(name,params||{});
  if(error) throw error;
  return data;
 }
 async function preferredSummary(){return rpc('business_preferred_location_summary');}
 async function preferredUsage(locationId){return rpc('business_preferred_location_usage',{p_location_id:locationId});}
 async function programUsage(programId){return rpc('business_partner_program_usage',{p_partner_program_id:programId});}
 function summarize(rows){return (rows||[]).reduce((a,r)=>{a.events+=Number(r.event_count||r.events||0);a.users+=Number(r.unique_users||r.users||0);a.activations+=Number(r.activations||0);a.visits+=Number(r.visits||0);a.redemptions+=Number(r.redemptions||0);return a;},{events:0,users:0,activations:0,visits:0,redemptions:0});}
 window.kleenestBusinessAnalytics={preferredSummary,preferredUsage,programUsage,summarize};
})();
