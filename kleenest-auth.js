/* Kleenest authentication lifecycle controller. Single source of truth for UI auth state. */
(function(){'use strict';
 const api=window.KleenestAuth=window.KleenestAuth||{}; let current=null,ready=false;
 const emit=(name,detail)=>{const d=detail||{}; if(window.KleenestEvents?.emit)window.KleenestEvents.emit(name,d); window.dispatchEvent(new CustomEvent(name,{detail:d}));};
 async function getSession(){if(!window.KleenestSupabase?.session)throw new Error('Supabase is not ready.');return window.KleenestSupabase.session();}
 async function refresh(reason){current=await getSession()||null;ready=true;syncRuntime(current);emit('auth-state-changed',{session:current,authenticated:isAuthenticated(),ready:true,reason:reason||'refresh'});return current;}
 function syncRuntime(session){if(window.KleenestRuntime){window.KleenestRuntime.session=session||null;if(session)window.KleenestRuntime.user=window.KleenestRuntime.user||null;else window.KleenestRuntime.user=null;}if(typeof state!=='undefined'){state.session=session?state.session:null;}}
 async function signOut(){if(!window.KleenestSupabase?.signOut)throw new Error('Supabase is not ready.');let result;try{result=await window.KleenestSupabase.signOut();}catch(error){await refresh('signout-failed-sync');throw error;}current=null;ready=true;syncRuntime(null);emit('auth-state-changed',{session:null,authenticated:false,ready:true,reason:'signout'});emit('auth-signed-out',{session:null});return result;}
 function get(){return current;} function isAuthenticated(){return !!(current?.user?.id||current?.user?.email||current?.id);} function state(){return{session:current,authenticated:isAuthenticated(),ready};}
 Object.assign(api,{getSession,refresh,signOut,get,isAuthenticated,state}); window.KleenestUI=window.KleenestUI||{};window.KleenestUI.auth=api;
 window.addEventListener('kleenest:auth-state-changed',e=>{current=e.detail?.session||null;ready=e.detail?.ready!==false;syncRuntime(current);});
 getSession().then(s=>{current=s||null;ready=true;syncRuntime(current);emit('auth-state-changed',{session:current,authenticated:isAuthenticated(),ready:true,reason:'initial'});}).catch(()=>{current=null;ready=true;syncRuntime(null);emit('auth-state-changed',{session:null,authenticated:false,ready:true,reason:'initial-error'});});
})();