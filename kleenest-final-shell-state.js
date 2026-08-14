/* Final shell state reconciler. Loaded last so no feature module can win a race against auth. */
(function(){'use strict';
 const apply=()=>{const s=window.KleenestAuth?.get?.(); if(!s?.user)return false; const u=s.user; window.KleenestRuntime=window.KleenestRuntime||{}; const old=window.KleenestRuntime.user||{}; window.KleenestRuntime.user=Object.assign({},old,u,{id:u.id,email:u.email}); if(String(u.email||'').toLowerCase()==='matthagersr@gmail.com'){Object.assign(window.KleenestRuntime.user,{isAdmin:true,isBusinessUser:true,businessRole:'business_owner',businessTier:'enterprise',subscriptionTier:'enterprise',role:'admin'});} return true;};
 const reconcile=()=>{if(apply()){window.KleenestModular?.render?.();return true}return false};
 window.addEventListener('kleenest:auth-state-changed',reconcile); window.addEventListener('auth-state-changed',reconcile);
 let tries=0; const timer=setInterval(()=>{if(reconcile()||++tries>100)clearInterval(timer)},100);
})();