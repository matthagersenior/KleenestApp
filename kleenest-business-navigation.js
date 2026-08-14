/* Stable Business/Admin navigation for the modular shell. */
(function(){'use strict';
 let cached={user:null,hasBusiness:false,isAdmin:false}, resolving=false, generation=0;
 const normalize=v=>String(v||'').toLowerCase();
 async function resolve(force=false){
  if(resolving)return cached;
  if(!force && cached.user)return cached;
  resolving=true;
  try{
   const api=window.KleenestSupabase;
   const s=await api?.session?.();
   if(!s){cached={user:null,hasBusiness:false,isAdmin:false};return cached;}
   let p=window.KleenestRuntime?.user||null;
   try{p=await api.profile()||p;}catch(e){console.warn('[Kleenest] profile lookup unavailable',e);}
   let memberships=[];
   try{memberships=await api.businessMemberships?.()||[];}catch(e){console.warn('[Kleenest] business memberships unavailable',e);}
   const role=normalize(p?.role);
   const tier=normalize(p?.subscription_tier||p?.subscriptionTier);
   const memberAdmin=memberships.some(m=>['owner','admin','manager'].includes(normalize(m?.role)));
   const isAdmin=!!(p?.is_admin||role==='admin'||memberAdmin||tier==='enterprise');
   const hasBusiness=memberships.length>0||isAdmin||tier==='enterprise';
   cached={user:p,hasBusiness,isAdmin};
  }catch(e){console.warn('[Kleenest] business navigation check failed',e);}
  finally{resolving=false;}
  return cached;
 }
 function currentNav(){return document.querySelector('header nav');}
 function hasExpected(nav,c){
  if(!nav)return false;
  const business=nav.querySelector('[data-business-view="Business"]');
  const admin=nav.querySelector('[data-business-view="Admin"]');
  return c.hasBusiness ? !!business && (!c.isAdmin||!!admin) : !business&&!admin;
 }
 async function inject(force=false){
  const my=++generation;
  const c=await resolve(force);
  if(my!==generation)return;
  /* Re-query AFTER async auth/profile resolution. The modular renderer can replace the header while await is pending. */
  const nav=currentNav();
  if(!nav)return;
  if(hasExpected(nav,c))return;
  nav.querySelectorAll('[data-business-view]').forEach(b=>b.remove());
  if(!c.hasBusiness)return;
  ['Business',...(c.isAdmin?['Admin']:[])].forEach(label=>{
   const b=document.createElement('button');
   b.type='button';b.textContent=label;b.dataset.businessView=label;
   b.className='business-nav-button';
   if((window.KleenestModular?.activeView||'')===label)b.classList.add('active');
   nav.appendChild(b);
  });
 }
 async function open(label){
  const root=document.getElementById('modular-root');if(!root)return;
  const nav=currentNav();nav?.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
  nav?.querySelector(`[data-business-view="${label}"]`)?.classList.add('active');
  try{await window.KleenestBusinessWorkspace?.mount?.(root,{mode:label.toLowerCase()});}
  catch(e){console.error('[Kleenest] business workspace failed',e);root.innerHTML=`<section class="card"><h1>${label}</h1><p class="muted" style="margin-top:8px">Business workspace could not be loaded. Please try again.</p><button class="primary" style="margin-top:10px" data-business-retry="${label}">Retry</button></section>`;}
  setTimeout(()=>inject(false),0);
 }
 document.addEventListener('click',e=>{
  const b=e.target.closest?.('[data-business-view]');
  if(b){e.preventDefault();e.stopPropagation();open(b.dataset.businessView);return;}
  const r=e.target.closest?.('[data-business-retry]');
  if(r){e.preventDefault();open(r.dataset.businessRetry);}
 },true);
 function start(){
  let lastNav=null,lastSignature='';
  const refresh=()=>{
   const nav=currentNav();
   const signature=nav?nav.innerHTML:'';
   if(nav!==lastNav||signature!==lastSignature){lastNav=nav;lastSignature=signature;inject(false);}
  };
  refresh();
  const observer=new MutationObserver(refresh);
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('kleenest:auth-ui-refresh',()=>{cached={user:null,hasBusiness:false,isAdmin:false};generation++;setTimeout(()=>inject(true),0);});
  window.addEventListener('kleenest:auth-state-changed',()=>{cached={user:null,hasBusiness:false,isAdmin:false};generation++;setTimeout(()=>inject(true),0);});
  window.KleenestBusinessNavigation={inject,open,resolve};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();