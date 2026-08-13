/* Kleenest shared Supabase browser client. */
(function(){'use strict';
 const url='https://ssgesjzdvdsqacdtasje.supabase.co';
 const publishableKey='sb_publishable_f1rbczgvWKSQy2g9mTDQZg_K9Wv19bL';
 function getClient(){if(window.supabase?.createClient){if(!window.KleenestSupabaseClient)window.KleenestSupabaseClient=window.supabase.createClient(url,publishableKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});return window.KleenestSupabaseClient;}throw new Error('Supabase JavaScript client is not loaded');}
 async function session(){const {data,error}=await getClient().auth.getSession();if(error)throw error;return data.session;}
 async function signIn(email,password){const {data,error}=await getClient().auth.signInWithPassword({email,password});if(error)throw error;return data;}
 async function signUp(email,password,metadata){const {data,error}=await getClient().auth.signUp({email,password,options:{data:metadata||{}}});if(error)throw error;return data;}
 async function signOut(){const {error}=await getClient().auth.signOut();if(error)throw error;return true;}
 async function rpc(name,args){const {data,error}=await getClient().rpc(name,args||{});if(error)throw error;return data;}
 async function profile(){const s=await session();if(!s)return null;const {data,error}=await getClient().from('profiles').select('*').eq('id',s.user.id).maybeSingle();if(error)throw error;return data;}
 async function businessMemberships(){const s=await session();if(!s)return [];const {data,error}=await getClient().from('business_members').select('*, businesses(*)').eq('user_id',s.user.id);if(error)throw error;return data||[];}
 async function ensureProfile(){return rpc('ensure_current_user_profile');}
 async function ensureDemoMembership(){return rpc('ensure_current_user_demo_membership');}
 async function provision(){const s=await session();if(!s)return null;const p=await ensureProfile();let d=[];try{d=await ensureDemoMembership();}catch(e){console.warn('Demo provisioning skipped:',e);}return {session:s,profile:p,demoMemberships:d};}
 async function preferredEligibility(locationId){return rpc('check_preferred_eligibility',{p_location_id:locationId});}
 async function activatePreferred(locationId,programId){return rpc('activate_preferred_location',{p_location_id:locationId,p_partner_program_id:programId||null});}
 async function usePreferred(locationId){return rpc('record_preferred_location_use',{p_location_id:locationId});}
 async function createBusiness(name,address,phone,website,type){return rpc('create_business_for_current_user',{p_name:name,p_address:address,p_phone:phone||null,p_website:website||null,p_type:type||'other'});}
 window.KleenestSupabase={getClient,client:getClient,session,signIn,signUp,signOut,rpc,profile,businessMemberships,ensureProfile,ensureDemoMembership,provision,preferredEligibility,activatePreferred,usePreferred,createBusiness};
})();