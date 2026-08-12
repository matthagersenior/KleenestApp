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
 async function reviews(businessId){await auth();const {data,error}=await client().from('reviews').select('*').eq('business_id',businessId).order('created_at',{ascending:false}).limit(50);if(error)throw error;return data||[];}
 window.KleenestBusiness.loadState=async function(businessId,start,end){
   if(!businessId)throw new Error('A business ID is required.');
   const [dashboardData,members,locs,reviewData]=await Promise.all([dashboard(businessId,start,end),membership(businessId),locations(businessId),reviews(businessId)]);
   const promos=await promotions(locs.map(x=>x.id));
   const result={businessId,dashboard:dashboardData,members,locations:locs,reviews:reviewData,promotions:promos,loadedAt:new Date().toISOString()};
   window.dispatchEvent(new CustomEvent('kleenest:business-state-loaded',{detail:result}));
   return result;
 };
 window.KleenestBusiness.loadForCurrentUser=async function(start,end){
   await auth();
   const {data,error}=await client().from('business_members').select('business_id').order('business_id');
   if(error)throw error;
   const ids=[...new Set((data||[]).map(x=>x.business_id).filter(Boolean))];
   const businesses=[];
   for(const id of ids)businesses.push(await window.KleenestBusiness.loadState(id,start,end));
   const result={businesses,loadedAt:new Date().toISOString()};
   window.dispatchEvent(new CustomEvent('kleenest:business-state-collection-loaded',{detail:result}));
   return result;
 };
 window.KleenestBusiness.dashboard=dashboard;
 window.KleenestBusiness.membership=membership;
 window.KleenestBusiness.locations=locations;
 window.KleenestBusiness.promotions=promotions;
 window.KleenestBusiness.reviews=reviews;
 window.KleenestUI=window.KleenestUI||{};
 window.KleenestUI.loadBusinessState=window.KleenestBusiness.loadForCurrentUser;
})();