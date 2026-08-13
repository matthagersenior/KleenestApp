/* Full-featured demo environment boundary. Keeps demo behavior separate from production data flows. */
(function(){'use strict';
 const D=window.KleenestDemo=window.KleenestDemo||{};
 D.enable=()=>{sessionStorage.setItem('kleenest:demo','1');window.KleenestPlatform?.demo.enable();window.dispatchEvent(new CustomEvent('kleenest:demo-changed',{detail:{enabled:true}}));};
 D.disable=()=>{sessionStorage.removeItem('kleenest:demo');window.KleenestPlatform?.demo.disable();window.dispatchEvent(new CustomEvent('kleenest:demo-changed',{detail:{enabled:false}}));};
 D.enabled=()=>sessionStorage.getItem('kleenest:demo')==='1';
 D.snapshot=()=>({enabled:D.enabled(),surfaces:['Home','Maps','Route','Details','Social','Profile','Business','Enterprise','Admin'],features:['favorites','family','following','followers','liked reviews','badges','streaks','levels','points','reviews','check-ins','verification','business tiers','partner access','campaigns','ROI','fleet analytics','enterprise benchmarking','contests','rewards']});
 D.guardProductionWrite=(operation)=>{if(D.enabled()&&/^production:(write|delete)/.test(String(operation)))throw new Error('Demo environment blocks production writes');return true;};
})();
