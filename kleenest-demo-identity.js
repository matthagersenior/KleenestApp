/* Client-side demo identity bridge. Auth remains authoritative. */
(function(){'use strict';
 async function rpc(name,params){const c=window.kleenestSupabase;if(!c)throw new Error('Supabase unavailable');const r=await c.rpc(name,params||{});if(r.error)throw r.error;return r.data;}
 window.kleenestDemoIdentity={
  register:(key,name,username,tier)=>rpc('demo_register_identity',{p_demo_key:key,p_display_name:name,p_username:username,p_subscription_tier:tier}),
  async link(key){const c=window.kleenestSupabase;if(!c)throw new Error('Supabase unavailable');const s=await c.auth.getUser();if(s.error)throw s.error;if(!s.data.user)throw new Error('Sign in before linking a demo identity');return rpc('demo_link_identity',{p_demo_key:key,p_auth_user_id:s.data.user.id});}
 };
})();
