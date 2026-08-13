/* Keep legacy UI state synchronized with Supabase without creating a second auth source. */
(function(){'use strict';
 const api=window.KleenestSessionBridge=window.KleenestSessionBridge||{};
 let lastUserId=null;
 function sync(detail){const user=detail?.user||null;const id=user?.id||detail?.session?.user?.id||null;if(id===lastUserId)return;lastUserId=id;try{if(typeof state!=='undefined'){state.session=id;if(typeof save==='function')save();if(typeof render==='function')render();}}catch(e){console.warn('Legacy UI session sync skipped:',e);}window.dispatchEvent(new CustomEvent('kleenest:session-synced',{detail:{user,session:detail?.session||null}}));}
 window.addEventListener('kleenest:auth-changed',e=>sync(e.detail));
 window.addEventListener('kleenest:auth-state-changed',e=>sync(e.detail));
 window.addEventListener('kleenest:auth-logout',()=>{lastUserId=null;try{if(typeof state!=='undefined'){state.session=null;if(typeof save==='function')save();if(typeof render==='function')render();}}catch(_){} });
 api.current=()=>({userId:lastUserId,session:window.KleenestRuntime?.session||null,user:window.KleenestRuntime?.user||null});
})();
