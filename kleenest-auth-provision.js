/* Post-auth provisioning bridge. Safe to call after every Supabase login. */
(function(){'use strict';
 async function provision(){const c=window.KleenestSupabase?.client;if(!c)throw new Error('Supabase is not ready.');const s=await c().auth.getSession();if(!s?.data?.session)return null;const profile=await c().rpc('ensure_current_user_profile');if(profile.error)throw profile.error;let membership=null;try{membership=await c().rpc('ensure_current_user_demo_membership');if(membership.error)throw membership.error;}catch(error){console.warn('Demo membership provisioning skipped:',error);}
 return {profile:profile.data,membership:membership?.data||[]};}
 async function afterAuth(){try{return await provision();}catch(error){console.error('Post-auth provisioning failed:',error);throw error;}}
 window.kleenestAuthProvision={provision,afterAuth};
})();
