/* Kleenest Business Analytics — single live Preferred reporting bridge. */
(function(){'use strict';
 const api=window.kleenestBusinessAnalytics=window.kleenestBusinessAnalytics||{};
 async function rpc(name,params){const client=window.KleenestSupabase?.client?.();if(!client)throw new Error('Supabase client unavailable');const {data,error}=await client.rpc(name,params||{});if(error)throw error;return data;}
 function range(start,end){return {p_start:start||new Date(Date.now()-30*86400000).toISOString(),p_end:end||new Date().toISOString()};}
 async function preferredAnalytics(businessId,start,end){if(!businessId)throw new Error('Business ID is required');return rpc('partner_preferred_analytics',{p_business_id:businessId,...range(start,end)});}
 async function current(start,end){const memberships=await window.KleenestSupabase.businessMemberships();const admins=[...new Set((memberships||[]).filter(m=>['owner','admin'].includes(String(m.role||'').toLowerCase())).map(m=>m.business_id).filter(Boolean))];return Promise.all(admins.map(id=>preferredAnalytics(id,start,end)));}
 async function preferredSummary(start,end){return (await current(start,end)).flatMap(x=>Array.isArray(x?.locations)?x.locations:[]);}
 async function preferredUsage(locationId,start,end){return (await preferredSummary(start,end)).filter(r=>String(r.location_id)===String(locationId));}
 async function programUsage(programId,start,end){return (await current(start,end)).flatMap(x=>Array.isArray(x?.programs)?x.programs:[]).filter(r=>String(r.program_id)===String(programId));}
 function summarize(rows){return (rows||[]).reduce((a,r)=>{a.events+=Number(r.event_count||r.events||r.uses||0);a.users+=Number(r.unique_users||r.users||0);a.activations+=Number(r.activations||0);a.visits+=Number(r.visits||r.uses||0);a.redemptions+=Number(r.redemptions||0);return a;},{events:0,users:0,activations:0,visits:0,redemptions:0});}
 api.rpc=rpc;api.range=range;api.preferredAnalytics=preferredAnalytics;api.current=current;api.preferredSummary=preferredSummary;api.preferredUsage=preferredUsage;api.programUsage=programUsage;api.summarize=summarize;
})();
