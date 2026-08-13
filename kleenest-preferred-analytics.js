/* Preferred usage bridge. Server/database remains authoritative. */
(function(){'use strict';
 async function usage(locationId,activationId,source){if(!window.KleenestSupabase?.client)throw new Error('Supabase unavailable');const r=await window.KleenestSupabase.client().rpc('record_preferred_usage',{p_location_id:locationId,p_activation_id:activationId||null,p_source:source||'preferred'});if(r.error)throw r.error;window.dispatchEvent(new CustomEvent('kleenest:preferred-usage-recorded',{detail:{eventId:r.data,locationId}}));return r.data;}
 async function analytics(){if(!window.KleenestSupabase?.client)throw new Error('Supabase unavailable');const r=await window.KleenestSupabase.client().from('partner_preferred_usage_analytics').select('*');if(r.error)throw r.error;return r.data||[];}
 window.KleenestPreferredAnalytics={recordUsage:usage,getBusinessAnalytics:analytics};
})();
