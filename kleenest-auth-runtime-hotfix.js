/* Auth lifecycle hotfix: one authoritative guest/authenticated UI state. */
(function(){'use strict';
 const getClient=()=>window.KleenestSupabase?.getClient?.()||window.kleenestSupabase;
 const isSignedIn=()=>!!window.KleenestRuntime?.user;
 async function loadUser(){const s=await window.KleenestSupabase?.session?.();if(!s){if(window.KleenestRuntime)window.KleenestRuntime.user=null;return null;}const p=await window.KleenestSupabase.profile();if(window.KleenestRuntime)window.KleenestRuntime.user=p?Object.assign({},p,{email:s.user.email}):{id:s.user.id,email:s.user.email,name:s.user.user_metadata?.display_name||s.user.email};return window.KleenestRuntime.user;}
 function rerender(){const active=document.querySelector('nav button.active');if(active){active.click();return;}window.KleenestModular?.start?.();}
 function authTab(){const nav=document.querySelector('header nav');if(!nav)return;let b=nav.querySelector('[data-auth-tab]');const signed=!!window.KleenestRuntime?.user;if(!b){b=document.createElement('button');b.dataset.authTab='1';nav.insertBefore(b,nav.firstChild);}b.textContent=signed?'Account':'Sign In / Sign Up';b.className='auth-button'+(!signed?' active':'');b.onclick=e=>{e.preventDefault();if(signed){const p=nav.querySelector('[data-view="Profile"]');p?.click();}else window.KleenestAuthUI?.open?.('signin');};}
 async function refresh(){try{await loadUser();}catch(e){console.warn('[Kleenest auth]',e);}authTab();rerender();authTab();}
 document.addEventListener('click',e=>{if(e.target.closest('#login')){e.preventDefault();window.KleenestAuthUI?.open?.('signin');}if(e.target.closest('#logout')){e.preventDefault();(async()=>{try{await window.KleenestSupabase.signOut();}catch(err){console.warn('[Kleenest auth logout]',err);}if(window.KleenestRuntime)window.KleenestRuntime.user=null;authTab();rerender();authTab();})();}},true);
 function install(){authTab();const c=getClient();if(c?.auth?.onAuthStateChange)c.auth.onAuthStateChange(async(type)=>{if(type==='SIGNED_IN'||type==='SIGNED_OUT'||type==='USER_UPDATED'){setTimeout(refresh,0);}});setTimeout(async()=>{try{await loadUser();}catch(e){}authTab();},0);}
 window.KleenestAuthRuntimeHotfix={refresh,loadUser};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
