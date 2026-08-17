/* Kleenest Admin Canonical Bridge v2 — establishes authoritative admin entitlement before the existing feature-rich Admin Core renders. */
(function(g){'use strict';
  if(g.KleenestAdminCanonicalBridgeV2)return;
  function client(){return g.KleenestSupabaseClient||(g.KleenestSupabase&&g.KleenestSupabase.client&&g.KleenestSupabase.client())}
  async function resolve(){
    var s=client(); var u=g.KleenestRuntime?.user||g.KleenestAuth?.get?.()||{};
    try{if(s?.auth){var a=await s.auth.getUser();if(a?.data?.user)u=Object.assign({},u,a.data.user)}}catch(e){}
    if(u?.id&&s){try{var p=await s.from('profiles').select('id,is_admin,role,app_role,is_business_user,subscription').eq('id',u.id).maybeSingle();if(p?.data)u=Object.assign({},u,p.data)}catch(e){}}
    if(g.KleenestRuntime)g.KleenestRuntime.user=u;
    g.KleenestAdminCanonicalState={user:u,isAdmin:!!(u?.is_admin===true||['admin','platform_admin','super_admin','owner'].includes(String(u?.role||u?.app_role||'').toLowerCase()))};
    return g.KleenestAdminCanonicalState;
  }
  function install(){var core=g.KleenestPlatformAdminCoreV2;if(!core?.render||core.__canonicalBridgeV2)return false;var original=core.render;core.render=async function(root){var state=await resolve();if(!state.isAdmin){root.innerHTML='<div class="ka"><section class="ka-card ka-hero"><small>PLATFORM ADMINISTRATION</small><h1>Administrator access required</h1><p>The signed-in account does not currently have platform administrator entitlement.</p></section></div>';return}return original(root)};core.__canonicalBridgeV2=true;return true}
  g.KleenestAdminCanonicalBridgeV2={resolve:resolve,install:install};
  if(!install())setTimeout(install,0);
})(window);