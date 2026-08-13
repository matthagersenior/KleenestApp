/* Final modular readiness gate: fail closed on missing core boundaries. */
(function(){'use strict';
 const G=window.KleenestReadinessGate=window.KleenestReadinessGate||{};
 const required=['KleenestNavigation','KleenestSurfaceActions','KleenestPlatform','KleenestDemo','KleenestUI'];
 G.check=()=>{const missing=required.filter(k=>!window[k]);const result={ok:missing.length===0,missing,timestamp:Date.now()};window.dispatchEvent(new CustomEvent('kleenest:readiness',{detail:result}));return result;};
 G.productionSafe=()=>{const r=G.check();return r.ok&&window.KleenestDemo?.guardProductionWrite;};
 G.nativeReady=()=>!!window.KleenestPlatform?.capabilities;
 G.demoReady=()=>!!window.KleenestDemo?.snapshot;
})();
