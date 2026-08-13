/* Kleenest Business Analytics — single live Preferred reporting bridge. */
(function(){'use strict';
 async function rpc(name,params){const client=window.KleenestSupabase?.client?.();if(!client)throw new Error('Supabase client unavailable');const {data,error}=await client.rpc(name,params||{});if(error)throw error;return data;}
 async function preferredAnalytics(businessId,start,end){return rpc('partner_preferred_analytics',{p_business_id:businessId,p_start:start||new Date(Date.now()-30*86400000).toISOString(),p_end:end||new Date().toISOString()});}
 async function current(){const memberships=await window.KleenestSupabase.businessMemberships();const admins=(memberships||[]).filter(m=>['owner','admin'].includes(String(m.role||'').toLowerCase()));const out=[];for(const m of admins){out.push(await preferredAnalytics(m.business_id));}return out;}
 async function preferredSummary(){const all=await current();return all.flatMap(x=>Array.isArray(x?.locations)?x.locations:[]);}
 async function preferredUsage(locationId){const rows=await preferredSummary();return rows.filter(r=>String(r.location_id)===String(locationId));}
 async function programUsage(programId){const all=await current();return all.flatMap(x=>Array.isArray(x?.programs)?x.programs:[]).filter(r=>String(r.program_id)===String(programId));}
 function summarize(rows){return (rows||[]).reduce((a,r)=>{a.events+=Number(r.event_count||r.events||r.uses||0);a.users+=Number(r.unique_users||r.users||0);a.activations+=Number(r.activations||0);a.visits+=Number(r.visits||r.uses||0);a.redemptions+=Number(r.redemptions||0);return a;},{events:0,users:0,activations:0,visits:0,redemptions:0});}
 window.kleenestBusinessAnalytics={preferredAnalytics,current,preferredSummary,preferredUsage,programUsage,summarize};
})();
