/* Lightweight production/runtime health checks. Read-only diagnostics. */
(function(){'use strict';
 const api=window.KleenestRuntimeHealth=window.KleenestRuntimeHealth||{};
 const names=['KleenestSupabase','KleenestRuntime','KleenestBusinessData','KleenestPartnershipUI','kleenestAcceptance','KleenestSessionBridge','kleenestLegacyAuthGuard','KleenestAccountLifecycle','KleenestAccountUI','kleenestBusinessAnalytics'];
 api.snapshot=function(){const missing=names.filter(n=>!window[n]);return {ok:missing.length===0,missing,ready:!!window.KleenestRuntime?.supabaseReady?.(),sessionKnown:!!window.KleenestRuntime?.session,userKnown:!!window.KleenestRuntime?.user};};
 api.check=async function(){const s=api.snapshot();if(s.missing.length)return s;if(!s.ready)return s;try{const session=await window.KleenestRuntime.getSession();return {...s,sessionAuthenticated:!!session,ok:s.ok};}catch(e){return {...s,ok:false,error:e?.message||String(e)};}};
 window.addEventListener('kleenest:supabase-ready',()=>{setTimeout(()=>api.check().then(r=>window.dispatchEvent(new CustomEvent('kleenest:runtime-health',{detail:r}))),0);});
})();
