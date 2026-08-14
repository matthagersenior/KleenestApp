/* Final shell-state bridge. The modular entry owns navigation; this file only synchronizes auth/role state. */
(function(){'use strict';
 async function sync(reason){
  const s=window.KleenestAuth?.get?.()||await window.KleenestAuth?.getSession?.().catch(()=>null);const old=window.KleenestRuntime?.user||{};
  if(s){const email=String(s.user?.email||old.email||'').toLowerCase();window.KleenestRuntime=window.KleenestRuntime||{};window.KleenestRuntime.user={...old,id:s.user?.id||old.id,email:s.user?.email||old.email,isAdmin:!!(old.isAdmin||old.is_admin||String(old.role||'').toLowerCase()==='admin'||email==='matthagersr@gmail.com'),businessId:old.businessId||old.business_id||null,businessRole:old.businessRole||old.business_role||((old.isAdmin||old.is_admin||String(old.role||'').toLowerCase()==='admin'||email==='matthagersr@gmail.com')?'owner':undefined),businessTier:old.businessTier||old.business_tier||old.subscriptionTier||old.subscription_tier||'free'};window.state=window.state||{};window.state.session=window.KleenestRuntime.user;}
  else if(window.KleenestRuntime)window.KleenestRuntime.user=null;
  if(window.KleenestModular?.render)await window.KleenestModular.render();
 }
 window.KleenestShellStabilizer={sync};
 window.addEventListener('kleenest:auth-state-changed',()=>setTimeout(()=>sync('auth'),0));window.addEventListener('kleenest:auth-ui-refresh',()=>setTimeout(()=>sync('auth-ui'),0));window.addEventListener('kleenest:profile-updated',()=>setTimeout(()=>sync('profile'),0));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>sync('startup'),100),{once:true});else setTimeout(()=>sync('startup'),100);
})();