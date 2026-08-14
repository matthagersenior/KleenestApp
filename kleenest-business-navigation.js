/* Business/Admin navigation bridge for the modular shell. Business/Admin are derived from the authenticated Supabase profile/memberships and survive every modular redraw. */
(function(){'use strict';
 let lastNav=null, observer=null, syncing=false, cached={user:null,hasBusiness:false,isAdmin:false};
 async function resolve(){
  if(syncing)return cached; syncing=true;
  try{
   const api=window.KleenestSupabase;
   const s=await api?.session?.();
   if(!s){cached={user:null,hasBusiness:false,isAdmin:false};return cached;}
   let p=window.KleenestRuntime?.user||null;
   try{p=await api.profile();}catch(e){}
   const admin=!!(p?.is_admin||String(p?.role||'').toLowerCase()==='admin');
   let memberships=[];
   try{memberships=await api.businessMemberships?.()||[];}catch(e){console.warn('[Kleenest] business memberships unavailable',e);}
   const hasBusiness=admin||memberships.length>0||String(p?.subscription_tier||'').toLowerCase()==='enterprise';
   cached={user:p,hasBusiness,isAdmin:admin||memberships.some(m=>['owner','admin','manager'].includes(String(m?.role||'').toLowerCase()))||String(p?.subscription_tier||'').toLowerCase()==='enterprise'};
  }catch(e){console.warn('[Kleenest] business navigation auth check failed',e);}finally{syncing=false;}
  return cached;
 }
 async function inject(){
  const nav=document.querySelector('header nav');if(!nav)return;
  const c=await resolve();
  nav.querySelectorAll('[data-business-view]').forEach(b=>b.remove());
  if(!c.hasBusiness)return;
  const labels=['Business',...(c.isAdmin?['Admin']:[])];
  labels.forEach(label=>{const b=document.createElement('button');b.textContent=label;b.dataset.businessView=label;b.className='business-nav-button';nav.appendChild(b);});
 }
 async function open(label){
  const root=document.getElementById('modular-root');if(!root)return;
  document.querySelectorAll('header nav button').forEach(b=>b.classList.remove('active'));
  const b=document.querySelector(`[data-business-view="${label}"]`);if(b)b.classList.add('active');
  try{await window.KleenestBusinessWorkspace?.mount?.(root,{mode:label.toLowerCase()});}
  catch(e){console.error('[Kleenest] business workspace failed',e);root.innerHTML=`<section class="card"><h1>${label}</h1><p class="muted" style="margin-top:8px">Business workspace could not be loaded. Please try again.</p><button class="primary" style="margin-top:10px" data-business-retry="${label}">Retry</button></section>`;}
  setTimeout(()=>inject(),50);
 }
 document.addEventListener('click',e=>{const b=e.target.closest?.('[data-business-view]');if(b){e.preventDefault();e.stopImmediatePropagation();open(b.dataset.businessView);return;}const r=e.target.closest?.('[data-business-retry]');if(r){e.preventDefault();open(r.dataset.businessRetry);}},true);
 function watch(){const nav=document.querySelector('header nav');if(nav!==lastNav){lastNav=nav;inject();}}
 function start(){watch();observer=new MutationObserver(watch);observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('kleenest:auth-ui-refresh',()=>{cached={user:null,hasBusiness:false,isAdmin:false};setTimeout(()=>inject(),50);});window.addEventListener('kleenest:auth-state-changed',()=>{cached={user:null,hasBusiness:false,isAdmin:false};setTimeout(()=>inject(),50);});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();window.KleenestBusinessNavigation={inject,open,resolve};})();