/* Kleenest authentication lifecycle controller. Single source of truth for UI auth state. */
(function(){'use strict';
 const api=window.KleenestAuth=window.KleenestAuth||{};let current=null,ready=false;
 const emit=(name,detail)=>{const d=detail||{};if(window.KleenestEvents?.emit)window.KleenestEvents.emit(name,d);window.dispatchEvent(new CustomEvent(name,{detail:d}));};
 async function getSession(){if(!window.KleenestSupabase?.session)throw new Error('Supabase is not ready.');return window.KleenestSupabase.session();}
 const isAuthenticated=()=>!!(current?.user?.id||current?.user?.email||current?.id);
 async function refresh(reason){current=await getSession()||null;ready=true;emit('auth-state-changed',{session:current,authenticated:isAuthenticated(),ready:true,reason:reason||'refresh'});return current;}
 async function signOut(){if(!window.KleenestSupabase?.signOut)throw new Error('Supabase is not ready.');const r=await window.KleenestSupabase.signOut();current=null;ready=true;emit('auth-state-changed',{session:null,authenticated:false,ready:true,reason:'signout'});return r;}
 const state=()=>({session:current,authenticated:isAuthenticated(),ready});api.getSession=getSession;api.refresh=refresh;api.signOut=signOut;api.get=()=>current;api.isAuthenticated=isAuthenticated;api.state=state;
 window.KleenestUI=window.KleenestUI||{};window.KleenestUI.auth=api;
 window.addEventListener('kleenest:auth-state-changed',e=>{current=e.detail?.session||null;ready=e.detail?.ready!==false;});
 getSession().then(s=>{current=s||null;ready=true;emit('auth-state-changed',{session:current,authenticated:isAuthenticated(),ready:true,reason:'initial'});}).catch(()=>{current=null;ready=true;emit('auth-state-changed',{session:null,authenticated:false,ready:true,reason:'initial-error'});});
})();