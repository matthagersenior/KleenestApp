/* Post-auth provisioning bridge. Safe to call after every Supabase login. */
(function(){'use strict';
 async function provision(){
  const c=window.KleenestSupabase?.client;if(!c)throw new Error('Supabase is not ready.');
  const s=await c().auth.getSession();if(!s?.data?.session)return null;
  const [profile,membership]=await Promise.all([c().rpc('ensure_current_user_profile'),c().rpc('ensure_current_user_demo_membership')]);
  if(profile.error)throw profile.error;if(membership.error)throw membership.error;
  return {profile:profile.data,membership:membership.data};
 }
 window.kleenestAuthProvision={provision};
})();
