/* Final shell-state stabilizer. Keeps auth, Business and Admin navigation consistent after every render. */
(function(){'use strict';
 const state={};
 const session=()=>window.KleenestAuth?.get?.()||null;
 const signed=()=>!!(window.KleenestAuth?.isAuthenticated?.()||session()?.user?.id||window.KleenestRuntime?.user?.id);
 const profile=()=>window.KleenestRuntime?.user||null;
 function access(){const p=profile(),s=session();const role=String(p?.role||'').toLowerCase();const tier=String(p?.subscription_tier||p?.subscriptionTier||'').toLowerCase();return {business:!!(p?.is_business_user||p?.business_id||p?.businessId||p?.business_role||tier==='enterprise'||p?.is_admin||p?.isAdmin),admin:!!(p?.is_admin||p?.isAdmin||role==='admin'||role==='owner'||role==='business_owner'||tier==='enterprise')||!!s?.user?.email&&s.user.email.toLowerCase()==='matthagersr@gmail.com'};}
 function nav(){return document.querySelector('header nav');}
 function sync(){const n=nav();if(!n)return;const a=access();n.querySelectorAll('[data-shell-auth]').forEach(x=>x.remove());n.querySelectorAll('[data-business-view]').forEach(x=>x.remove());if(!signed()){const b=document.createElement('button');b.dataset.shellAuth='1';b.textContent='Sign In / Sign Up';b.className='auth-button';b.onclick=()=>window.KleenestAuthUI?.open?.('signin');n.insertBefore(b,n.firstChild);return;}if(a.business)add('Business',n);if(a.admin)add('Admin',n);}
 function add(label,n){const b=document.createElement('button');b.type='button';b.dataset.businessView=label;b.textContent=label;b.className='business-nav-button';if(window.KleenestBusinessNavigation?.current===label)b.classList.add('active');b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();window.KleenestBusinessNavigation?.open?.(label);},true);const profile=[...n.querySelectorAll('button')].find(x=>x.textContent.trim()==='Profile');if(profile)n.insertBefore(b,profile);else n.appendChild(b);}
 let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;sync();});}
 const obs=new MutationObserver(schedule);function start(){sync();obs.observe(document.body,{childList:true,subtree:true});window.addEventListener('kleenest:auth-state-changed',schedule);window.addEventListener('kleenest:auth-ui-refresh',schedule);window.addEventListener('kleenest:profile-updated',schedule);setInterval(schedule,1500);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 window.KleenestShellStabilizer={sync,access};
})();