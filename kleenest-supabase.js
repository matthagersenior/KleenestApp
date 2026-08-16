/* Kleenest shared Supabase browser client. */
(function(){'use strict';
 const url='https://ssgesjzdvdsqacdtasje.supabase.co';
 const publishableKey='sb_publishable_f1rbczgvWKSQy2g9mTDQZg_K9Wv19bL';
 function getClient(){if(window.supabase?.createClient){if(!window.KleenestSupabaseClient)window.KleenestSupabaseClient=window.supabase.createClient(url,publishableKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});return window.KleenestSupabaseClient;}throw new Error('Supabase JavaScript client is not loaded');}
 async function session(){const {data,error}=await getClient().auth.getSession();if(error)throw error;return data.session;}
 async function signUp(email,password,metadata={}){const {data,error}=await getClient().auth.signUp({email,password,options:{data:metadata}});if(error)throw error;return data;}
 async function signIn(email,password){const {data,error}=await getClient().auth.signInWithPassword({email,password});if(error)throw error;return data;}
 async function signOut(){const {error}=await getClient().auth.signOut();if(error)throw error;return true;}
 async function rpc(name,args){const {data,error}=await getClient().rpc(name,args||{});if(error)throw error;return data;}
 async function ensureSignupProfile({displayName='',username='',avatarUrl='',bio='',demo=true}={}){return rpc('ensure_signup_profile',{p_display_name:displayName||null,p_username:username||null,p_avatar_url:avatarUrl||null,p_bio:bio||null,p_is_demo_test:!!demo});}
 async function ensureProfile(){try{return await rpc('ensure_signup_profile',{p_display_name:null,p_username:null,p_avatar_url:null,p_bio:null,p_is_demo_test:true});}catch(e){return null;}}
 async function profile(){const s=await session();if(!s)return null;const {data,error}=await getClient().from('profiles').select('*').eq('id',s.user.id).maybeSingle();if(error)throw error;return data;}
 async function nearbyLocations(lat,lng,miles=25,limit=500){const radiusMeters=Math.max(100,Math.round(Number(miles)*1609.344));const {data,error}=await getClient().rpc('nearby_locations',{lat:Number(lat),lng:Number(lng),radius_meters:radiusMeters,limit_count:Number(limit)});if(error)throw error;return data||[];}
 async function businessMemberships(){
   const s=await session(); if(!s)return [];
   const c=getClient(),uid=s.user.id,email=String(s.user.email||'').toLowerCase();
   const out=[];
   const primary=await c.from('business_members').select('*, businesses(*)').eq('user_id',uid);
   if(!primary.error)out.push(...(primary.data||[]));
   if(!out.length){
     const alt=await c.from('app_business_memberships').select('*').eq('user_id',uid);
     if(!alt.error)for(const m of (alt.data||[]))out.push({...m,business_id:m.business_id||m.businessId});
   }
   if(!out.length){
     const owned=await c.from('locations').select('id,business_id,name,owner_email,created_by').or('created_by.eq.'+uid+',owner_email.ilike.'+email);
     if(!owned.error){
       const ids=[...new Set((owned.data||[]).map(x=>x.business_id).filter(Boolean))];
       for(const bid of ids){
         const b=await c.from('businesses').select('*').eq('id',bid).maybeSingle();
         out.push({business_id:bid,role:'owner',businesses:b.data||{id:bid}});
       }
     }
   }
   return out;
 }
 window.KleenestSupabase={getClient,client:getClient,session,signUp,signIn,signOut,rpc,profile,ensureProfile,ensureSignupProfile,nearbyLocations,nearby_locations:nearbyLocations,businessMemberships};
})();