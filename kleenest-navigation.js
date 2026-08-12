/* Kleenest navigation controller. Keeps page/tab state independent from the monolith. */
(function(){'use strict';
  const api=window.KleenestNavigation=window.KleenestNavigation||{};
  let current=null;
  function emit(detail){window.dispatchEvent(new CustomEvent('kleenest:navigation-changed',{detail}));}
  function activate(view){
    if(!view)return current;
    current=view;
    document.querySelectorAll('[data-kleenest-view]').forEach(el=>{
      const active=el.dataset.kleenestView===view;
      el.hidden=!active;
      el.setAttribute('aria-hidden',String(!active));
    });
    document.querySelectorAll('[data-kleenest-nav]').forEach(el=>{
      const active=el.dataset.kleenestNav===view;
      el.classList.toggle('active',active);
      el.setAttribute('aria-current',active?'page':'false');
    });
    emit({view});
    return view;
  }
  function init(){
    document.addEventListener('click',e=>{
      const el=e.target.closest?.('[data-kleenest-nav]');
      if(!el)return;
      e.preventDefault();
      activate(el.dataset.kleenestNav);
    });
    const initial=document.querySelector('[data-kleenest-nav].active')?.dataset.kleenestNav||document.querySelector('[data-kleenest-view]')?.dataset.kleenestView;
    if(initial)activate(initial);
  }
  api.activate=activate;
  api.current=()=>current;
  api.init=init;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();