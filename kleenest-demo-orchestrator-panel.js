/* UI adapter for demo provisioning. Mount beside existing demo controls. */
(function(){'use strict';
 function bind(root){if(!root)return;root.addEventListener('click',async e=>{const b=e.target.closest('[data-demo-orchestrator-action]');if(!b)return;b.disabled=true;try{const a=b.dataset.demoOrchestratorAction;if(a==='link')await window.kleenestDemoOrchestrator.linkDemo(b.dataset.demoKey);if(a==='business')await window.kleenestDemoOrchestrator.provisionBusiness(b.dataset.businessName||'Kleenest Demo Business');b.dispatchEvent(new CustomEvent('kleenest:demo-orchestrator-changed',{bubbles:true}));}catch(err){console.warn('[Kleenest demo orchestrator]',err);b.dispatchEvent(new CustomEvent('kleenest:demo-orchestrator-error',{bubbles:true,detail:err}));}finally{b.disabled=false;}});}
 window.kleenestDemoOrchestratorPanel={bind};
})();
