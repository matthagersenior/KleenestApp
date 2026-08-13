/* Demo integration orchestrator. Never creates Auth users; runs only after an authenticated user explicitly requests it. */
(function(){'use strict';
 async function rpc(name,params){const c=window.kleenestSupabase;if(!c)throw new Error('Supabase unavailable');const r=await c.rpc(name,params||{});if(r.error)throw r.error;return r.data;}
 async function currentUser(){const c=window.kleenestSupabase;if(!c)throw new Error('Supabase unavailable');const r=await c.auth.getUser();if(r.error)throw r.error;if(!r.data.user)throw new Error('Sign in first');return r.data.user;}
 async function linkDemo(key){const u=await currentUser();return rpc('demo_link_identity',{p_demo_key:key,p_auth_user_id:u.id});}
 async function listBusinesses(){return rpc('demo_list_test_businesses',{});}
 async function provisionBusiness(name){const u=await currentUser();return rpc('demo_provision_business',{p_name:name,p_auth_user_id:u.id});}
 window.kleenestDemoOrchestrator={currentUser,linkDemo,listBusinesses,provisionBusiness};
})();
