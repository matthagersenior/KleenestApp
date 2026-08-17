/* Kleenest Supabase resolver v1 — isolates the SDK namespace from the application client. */
(function(g){'use strict';
  const URL='https://ssgesjzdvdsqacdtasje.supabase.co';
  const KEY='sb_publishable_f1rbczgvWKSQy2g9mTDQZg_K9Wv19bL';
  const sdk=g.__KLEENEST_SUPABASE_JS__||g.KleenestSupabaseNamespace||g.supabase;
  if(!sdk||typeof sdk.createClient!=='function') throw new Error('Supabase JS v2 namespace unavailable to Kleenest resolver.');
  g.__KLEENEST_SUPABASE_JS__=sdk;
  const client=g.kleenestSupabase&&typeof g.kleenestSupabase.from==='function' ? g.kleenestSupabase : sdk.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  g.kleenestSupabase=client;
  g.KleenestSupabaseClient=client;
  g.__KLEENEST_SUPABASE_CLIENT__=client;
  const api=g.KleenestSupabase||{};
  const original=api;
  g.KleenestSupabase={...original,client:()=>client};
})(window);