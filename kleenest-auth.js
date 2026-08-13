/* Kleenest authentication lifecycle controller. */
(function(){'use strict';
  const api=window.KleenestAuth=window.KleenestAuth||{};
  let current=null;
  function emit(name,detail){return window.KleenestEvents?.emit?window.KleenestEvents.emit(name,detail):window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}));}
  async function getSession(){if(!window.KleenestSupabase?.session)throw new Error('Supabase is not ready.');return window.KleenestSupabase.session();}
  async function refresh(reason){const session=await getSession();current=session||null;emit('auth-state-changed',{session:current,reason:reason||'refresh'});return current;}
  async function signOut(){if(!window.KleenestSupabase?.signOut)throw new Error('Supabase is not ready.');const result=await window.KleenestSupabase.signOut();current=null;emit('auth-state-changed',{session:null,reason:'signout'});return result;}
  function get(){return current;}
  api.getSession=getSession;api.refresh=refresh;api.signOut=signOut;api.get=get;
  window.KleenestUI=window.KleenestUI||{};window.KleenestUI.auth=api;
  window.addEventListener('kleenest:auth-state-changed',e=>{current=e.detail?.session||null;});
  getSession().then(session=>{current=session||null;}).catch(()=>{});
})();