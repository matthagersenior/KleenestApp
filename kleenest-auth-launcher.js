/* Lazy auth entry: loaded by a user click, never during startup. */
(function(){'use strict';
 if(window.__KLEENEST_AUTH_LAUNCHER)return;
 window.__KLEENEST_AUTH_LAUNCHER=true;
 const load=(src,attr)=>new Promise((resolve,reject)=>{if(document.querySelector('script[data-kleenest-auth-src="'+src+'"]'))return resolve();const s=document.createElement('script');s.src=src;s.dataset.kleenestAuthSrc=src;if(attr)Object.assign(s,attr);s.onload=resolve;s.onerror=()=>reject(new Error('Unable to load '+src));document.head.appendChild(s);});
 async function open(mode){
  try{
   if(!window.supabase?.createClient)await load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
   if(!window.KleenestSupabase)await load('kleenest-supabase.js?v=auth20260815');
   if(!window.KleenestAuthUI)await load('kleenest-auth-ui.js?v=auth20260815');
   window.KleenestAuthUI.open(mode||'signin');
  }catch(e){console.error('[Kleenest] auth launch failed',e);alert('Kleenest sign-in could not load. Please refresh and try again.');}
 }
 window.KleenestAuthLauncher={open};
 document.addEventListener('click',e=>{const b=e.target.closest('[data-auth-open]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();open(b.dataset.authOpen||'signin');},true);
})();