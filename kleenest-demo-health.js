/* Development-only health helper. Not exposed as a production authorization surface. */
(function(){'use strict';
 async function run(){
  if(!window.KleenestSupabase?.client)throw new Error('Supabase is not ready.');
  const {data,error}=await window.KleenestSupabase.client().rpc('demo_network_health');
  if(error)throw error;return data;
 }
 window.kleenestDemoHealth={run};
})();
