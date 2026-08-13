/* Optional UI adapter for demo account creation/sign-in. */
(function(){'use strict';
 function bind(root){if(!root)return;root.addEventListener('click',async e=>{const b=e.target.closest('[data-demo-auth-action]');if(!b)return;const key=b.dataset.demoKey,password=b.dataset.demoPassword||'';b.disabled=true;try{const result=b.dataset.demoAuthAction==='create'?await window.kleenestDemoAuth.create(key,password):await window.kleenestDemoAuth.signIn(key,password);b.dispatchEvent(new CustomEvent('kleenest:demo-auth-success',{bubbles:true,detail:result}));}catch(err){b.dispatchEvent(new CustomEvent('kleenest:demo-auth-error',{bubbles:true,detail:err}));}finally{b.disabled=false;}});}
 window.kleenestDemoAuthPanel={bind};
})();
