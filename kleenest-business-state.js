/* Kleenest business live-state synchronization layer. */
(function(){
 'use strict';
 window.KleenestBusiness=window.KleenestBusiness||{};
 function client(){if(!window.KleenestSupabase?.client)throw new Error('Supabase is not ready.');return window.KleenestSupabase.client();}
 async function auth(){const s=await window.KleenestSupabase.session();if(!s)throw new Error('Please sign in to continue.');return s;}
 async function dashboard(businessId,start,end){await auth();const args={p_business_id:businessId};if(start)args.p_start=start;if(end)args.p_end=end;const {data,error}=await client().rpc('business_dashboard_summary',args);if(error)throw error;return data||[];}
 async function membership(businessId){await auth();const {data,error}=await client().from('business_members').select('*').eq('business_id',businessId);if(error)throw error;return data||[];}
 async function locations(businessId){await auth();const {data,error}=await client().from('locations').select('*').eq('business_id',businessId).order('name');if(error)throw error;return data||[];}
 async function promotions(locationIds){await auth();if(!locationIds.length)return [];const {data,error}=await client().from('promotions').select('*').in('location_id',locationIds).order('starts_at',{ascending:false});if(error)throw error;return data||[];}
 window.KleenestBusiness.loadState=async function(businessId,start,end){
   if(!businessId)throw new Error('A business ID is required.');
   const [dashboardData,members,locs]=await Promise.all([dashboard(businessId,start,end),membership(businessId),locations(businessId)]);
   const promos=await promotions(locs.map(x=>x.id));
   const result={businessId,dashboard:dashboardData,members,locations:locs,promotions:promos,loadedAt:new Date().toISOString()};
   window.dispatchEvent(new CustomEvent('kleenest:business-state-loaded',{detail:result}));
   return result;
 };
 window.KleenestBusiness.dashboard=dashboard;
 window.KleenestBusiness.membership=membership;
 window.KleenestBusiness.locations=locations;
 window.KleenestBusiness.promotions=promotions;
})();