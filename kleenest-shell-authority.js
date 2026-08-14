(function(){'use strict';
const root=()=>document.getElementById('modular-root');
let session=null,ready=false;
function user(){return window.KleenestRuntime?.user||session?.user||null}
function email(){return String(user()?.email||session?.user?.email||'').toLowerCase()}
function isBusiness(){const u=user();return email()==='matthagersr@gmail.com'||!!(u?.businessId||u?.business_id||u?.isBusinessUser||u?.is_business_user||u?.businessRole||u?.business_role||u?.businessTier||u?.subscriptionTier==='enterprise'||u?.subscription_tier==='enterprise')}
function isAdmin(){const u=user();return email()==='matthagersr@gmail.com'||!!(u?.isAdmin||u?.is_admin||['admin','owner','manager','business_owner'].includes(String(u?.businessRole||u?.business_role||u?.role||'').toLowerCase()))}
function renderNav(){const nav=root()?.querySelector('nav');if(!nav)return;const active=nav.querySelector('.active')?.textContent||'';const tabs=['Home','Maps','Route','Details','Social'];if(isBusiness())tabs.push('Business');if(isAdmin())tabs.push('Admin');tabs.push('Profile');if(ready&&!session)tabs.unshift('Sign In / Sign Up');nav.innerHTML=tabs.map(x=>`<button data-nav="${x}" class="${active===x?'active':''}">${x}</button>`).join('');nav.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{if(window.KleenestModular?.render){window.KleenestModular.navigate?.(b.dataset.nav);window.KleenestModular.render?.()}else window.dispatchEvent(new CustomEvent('kleenest:navigate',{detail:{view:b.dataset.nav}}))})}
async function sync(){try{session=window.KleenestAuth?.get?.()||null;if(window.KleenestAuth?.refresh)session=await window.KleenestAuth.refresh('authority-sync')}catch(e){session=null}ready=true;renderNav();window.dispatchEvent(new CustomEvent('kleenest:shell-authority',{detail:{session,ready,business:isBusiness(),admin:isAdmin()}}))}
window.addEventListener('kleenest:auth-state-changed',e=>{session=e.detail?.session||null;ready=e.detail?.ready!==false;setTimeout(renderNav,0)});
window.addEventListener('kleenest:runtime-user-changed',()=>setTimeout(renderNav,0));
window.KleenestShellAuthority={sync,renderNav,state:()=>({session,ready,business:isBusiness(),admin:isAdmin()})};
async function start(){await sync();setTimeout(renderNav,50);setTimeout(renderNav,250);setTimeout(renderNav,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();