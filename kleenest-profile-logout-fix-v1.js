/* Kleenest Profile logout bridge v1.
 * Intercepts the rendered Profile logout control and routes it through the
 * canonical runtime auth bridge. This is intentionally isolated from Profile UI.
 */
(function(g){'use strict';if(g.KleenestProfileLogoutFixV1)return;g.KleenestProfileLogoutFixV1=true;
async function logout(ev){var b=ev.target&&ev.target.closest?ev.target.closest('[data-a="logout"]'):null;if(!b)return;ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();if(b.dataset.busy==='1')return;b.dataset.busy='1';var old=b.textContent;b.textContent='Logging out…';try{var rt=g.KleenestRuntime;if(rt&&typeof rt.signOut==='function'){await rt.signOut()}else{var s=g.supabase||g.KleenestSupabase;var c=s?.client?.()||s;if(!c?.auth?.signOut)throw new Error('Authentication service unavailable.');await c.auth.signOut()}try{sessionStorage.clear()}catch(_){}g.dispatchEvent(new CustomEvent('kleenest:auth-changed',{detail:{session:null,user:null}}));location.reload()}catch(err){console.error('[Kleenest] logout failed',err);b.dataset.busy='0';b.textContent=old;alert(err?.message||'Unable to log out. Please try again.')}}
document.addEventListener('click',logout,true);
})(window);