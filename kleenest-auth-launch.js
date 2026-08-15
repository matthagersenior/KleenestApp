(function(){'use strict';
if(window.__KLEENEST_AUTH_LAUNCHER)return;window.__KLEENEST_AUTH_LAUNCHER=true;
const load=s=>new Promise((res,rej)=>{const e=document.createElement('script');e.src=s;e.onload=res;e.onerror=rej;document.head.appendChild(e)});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-auth-open]');if(!b)return;e.preventDefault();try{if(!window.KleenestSupabase){await load('kleenest-supabase.js')}if(!window.KleenestAuthUI){await load('kleenest-auth-ui.js')}window.KleenestAuthUI.open(b.dataset.authOpen||'signin')}catch(err){console.error('[Kleenest] auth launch failed',err);alert('Sign in is temporarily unavailable. Please refresh and try again.')}});
})();