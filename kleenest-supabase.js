/* Kleenest shared Supabase browser client. */
(function(){'use strict';
 const url='https://ssgesjzdvdsqacdtasje.supabase.co';
 const publishableKey='sb_publishable_f1rbczgvWKSQy2g9mTDQZg_K9Wv19bL';
 function getClient(){if(window.supabase?.createClient){if(!window.KleenestSupabaseClient)window.KleenestSupabaseClient=window.supabase.createClient(url,publishableKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});return window.KleenestSupabaseClient;}throw new Error('Supabase JavaScript client is not loaded');}
 async function session(){const {data,error}=await getClient().auth.getSession();if(error)throw error;return data.session;}
 async function signUp(email,password,metadata={}){const {data,error}=await getClient().auth.signUp({email,password,options:{data:metadata}});if(error)throw error;return data;}
 async function ensureSignupProfile({displayName='',username='',avatarUrl='',bio='',demo=true}={}){return rpc('ensure_signup_profile',{p_display_name:displayName||null,p_username:username||null,p_avatar_url:avatarUrl||null,p_bio:bio||null,p_is_demo_test:!!demo});}
 async function signOut(){const {error}=await getClient().auth.signOut();if(error)throw error;return true;}
 async function rpc(name,args){const {data,error}=await getClient().rpc(name,args||{});if(error)throw error;return data;}
 async function nearbyLocations(lat,lng,miles=25,limit=500){const radiusMeters=Math.max(100,Math.round(Number(miles)*1609.344));const {data,error}=await getClient().rpc('nearby_locations',{lat:Number(lat),lng:Number(lng),radius_meters:radiusMeters,limit_count:Number(limit)});if(error)throw error;return data||[];}
 async function businessMemberships(){const s=await session();if(!s)return [];const {data,error}=await getClient().from('business_members').select('*, businesses(*)').eq('user_id',s.user.id);if(error)throw error;return data||[];}
 window.KleenestSupabase={getClient,client:getClient,session,signUp,ensureSignupProfile,signOut,rpc,nearbyLocations,nearby_locations:nearbyLocations,businessMemberships};
})();
