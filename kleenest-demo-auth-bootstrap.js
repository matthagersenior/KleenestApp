/* Demo Auth bootstrap. Creates real Supabase Auth accounts through the shared signup boundary. */
(function(){'use strict';
 const accounts=[
  {key:'demo-premium-a',email:'demo.premium.a@kleenest.app',name:'Demo Premium A',username:'demo_premium_a',tier:'premium'},
  {key:'demo-fleet-a',email:'demo.fleet.a@kleenest.app',name:'Demo Fleet A',username:'demo_fleet_a',tier:'fleet'},
  {key:'demo-enterprise-a',email:'demo.enterprise.a@kleenest.app',name:'Demo Enterprise A',username:'demo_enterprise_a',tier:'enterprise'}
 ];
 function client(){if(window.KleenestSupabase?.getClient)return window.KleenestSupabase.getClient();throw new Error('Supabase client unavailable');}
 async function create(key,password){const a=accounts.find(x=>x.key===key);if(!a)throw new Error('Unknown demo account');const c=client();const p=String(password||'');if(p.length<8)throw new Error('Use a password of at least 8 characters');const r=await c.auth.signUp({email:a.email,password:p,options:{data:{demo_key:a.key,display_name:a.name,username:a.username,subscription_tier:a.tier,is_demo_test:true}}});if(r.error)throw r.error;await c.rpc('demo_register_identity',{p_demo_key:a.key,p_display_name:a.name,p_username:a.username,p_subscription_tier:a.tier});return {account:a,session:!!r.data.session,userId:r.data.user?.id||null,confirmationRequired:!r.data.session};}
 async function signIn(key,password){const a=accounts.find(x=>x.key===key);if(!a)throw new Error('Unknown demo account');const c=client();const r=await c.auth.signInWithPassword({email:a.email,password});if(r.error)throw r.error;await c.rpc('demo_link_identity',{p_demo_key:a.key,p_auth_user_id:r.data.user.id});return r.data;}
 window.kleenestDemoAuth={accounts,create,signIn};
})();