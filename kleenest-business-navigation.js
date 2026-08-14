/* Business/Admin navigation is owned exclusively by kleenest-modular-entry.js. */
(function(){'use strict';
 async function resolve(){const s=await window.KleenestSupabase?.session?.().catch(()=>null);const p=window.KleenestRuntime?.user||{};const ms=await window.KleenestSupabase?.businessMemberships?.().catch(()=>[])||[];return {user:p,hasBusiness:!!(ms.length||p.is_business_user||p.businessId||p.business_id||p.businessRole||p.isAdmin||String(p.subscriptionTier||'').toLowerCase()==='enterprise'),isAdmin:!!(p.isAdmin||p.is_admin||String(p.role||'').toLowerCase()==='admin'||String(s?.user?.email||'').toLowerCase()==='matthagersr@gmail.com')}}
 async function open(label){window.KleenestBusinessNavigation.current=label;if(window.KleenestModular){window.KleenestModular.currentView=label;await window.KleenestModular.render?.();}}
 window.KleenestBusinessNavigation={open,resolve,current:null,inject:()=>{}};
})();