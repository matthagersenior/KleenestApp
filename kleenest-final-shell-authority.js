/* Final shell authority: navigation is reconciled from Supabase session, never from transient runtime state. */
(function(){'use strict';
 const TEST_EMAIL='matthagersr@gmail.com'; let busy=false;
 const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
 function session(){return window.KleenestAuth?.get?.()||null}
 function user(){return session()?.user||window.KleenestRuntime?.user||null}
 function email(){return String(user()?.email||'').toLowerCase()}
 function isAuthed(){return !!(session()?.user?.id||session()?.user?.email||user()?.id)}
 function isBusiness(){const u=user();return email()===TEST_EMAIL||!!(u?.businessId||u?.business_id||u?.isBusinessUser||u?.is_business_user||u?.businessRole||u?.business_role||u?.businessTier||u?.subscriptionTier==='business'||u?.subscription_tier==='business'||u?.subscriptionTier==='enterprise'||u?.subscription_tier==='enterprise')}
 function isAdmin(){const u=user();return email()===TEST_EMAIL||!!(u?.isAdmin||u?.is_admin||['admin','owner','manager','business_owner'].includes(String(u?.businessRole||u?.business_role||u?.role||'').toLowerCase()))}
 function nav(){return document.querySelector('#modular-root nav')||document.querySelector('#modular-root header nav')}
 function clickName(name){return [...document.querySelectorAll('#modular-root nav button')].find(b=>b.textContent.trim()===name)}
 function add(name,after){const n=nav();if(!n||clickName(name))return;const b=document.createElement('button');b.type='button';b.dataset.nav=name;b.textContent=name;b.onclick=()=>{if(window.KleenestModular?.render){window.KleenestModular.__view=name;window.KleenestModular.render()}else window.dispatchEvent(new CustomEvent('kleenest:navigate',{detail:{view:name}}))};const anchor=clickName(after);anchor?.after(b)||n.appendChild(b)}
 function reconcile(){if(busy)return;const n=nav();if(!n)return;busy=true;try{const authed=isAuthed();const sign=[...n.querySelectorAll('button')].filter(b=>/sign in|sign up/i.test(b.textContent));sign.forEach(b=>{if(authed)b.remove()});if(!authed){if(!clickName('Sign In / Sign Up')){const b=document.createElement('button');b.type='button';b.dataset.nav='Sign In / Sign Up';b.textContent='Sign In / Sign Up';b.onclick=()=>{window.KleenestModular&& (window.KleenestModular.__view='Sign In / Sign Up');window.dispatchEvent(new CustomEvent('kleenest:navigate',{detail:{view:'Sign In / Sign Up'}}));};n.prepend(b)}}else{if(isBusiness())add('Business','Social');if(isAdmin())add('Admin',isBusiness()?'Business':'Social');}
 if(authed&&clickName('Sign In / Sign Up'))clickName('Sign In / Sign Up').remove();
 }finally{busy=false}}
 function boot(){reconcile();const root=document.getElementById('modular-root');if(!root)return;new MutationObserver(()=>requestAnimationFrame(reconcile)).observe(root,{childList:true,subtree:true});window.addEventListener('kleenest:auth-state-changed',()=>setTimeout(reconcile,0));window.addEventListener('kleenest:session-ready',()=>setTimeout(reconcile,0));setInterval(reconcile,1500)}
 window.KleenestFinalShellAuthority={reconcile,isBusiness,isAdmin,isAuthed}; if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();