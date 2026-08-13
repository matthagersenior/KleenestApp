/* Demo identity UI bridge. Safe to mount beside the existing demo-account controls. */
(function(){'use strict';
 const tiers=new Set(['premium','fleet','enterprise']);
 async function register(key,name,username,tier){
  if(!tiers.has(String(tier).toLowerCase()))throw new Error('Demo tier must be Premium, Fleet, or Enterprise');
  return window.kleenestDemoIdentity.register(key,name,username,String(tier).toLowerCase());
 }
 async function link(key){return window.kleenestDemoIdentity.link(key);}
 function bind(root){
  if(!root)return;
  root.addEventListener('click',async e=>{
   const b=e.target.closest('[data-demo-identity-action]');if(!b)return;
   try{
    const a=b.dataset.demoIdentityAction;
    if(a==='register')await register(b.dataset.demoKey,b.dataset.displayName,b.dataset.username,b.dataset.tier);
    if(a==='link')await link(b.dataset.demoKey);
    b.dispatchEvent(new CustomEvent('kleenest:demo-identity-changed',{bubbles:true}));
   }catch(err){console.warn('[Kleenest demo identity]',err);b.dispatchEvent(new CustomEvent('kleenest:demo-identity-error',{bubbles:true,detail:err}));}
  });
 }
 window.kleenestDemoIdentityPanel={bind,register,link};
})();
