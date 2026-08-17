/* Supabase compatibility bridge v1 — normalizes the global used by legacy Admin code. */
(function(g){'use strict';
  var wrapper=g.KleenestSupabase;
  var client=null;
  try{client=wrapper&&typeof wrapper.client==='function'?wrapper.client():wrapper&&wrapper.client||g.kleenestSupabase||null}catch(e){client=g.kleenestSupabase||null}
  if(client&&typeof client.rpc==='function'&&typeof client.from==='function'&&client.auth){
    g.KleenestSupabaseClient=client;
    g.__KLEENEST_SUPABASE_CLIENT__=client;
    /* Admin Core v2 historically resolves g.supabase first. The CDN namespace is not a client. */
    g.supabase=client;
  }
})(window);
