/* Kleenest navigation controller. Supports modular and legacy Pages controls. */
(function(){'use strict';
  const api=window.KleenestNavigation=window.KleenestNavigation||{};
  let current=null;
  const aliases={home:'home',map:'maps',maps:'maps',restroom:'details',details:'details',route:'route',routes:'route',profile:'profile',account:'profile'};
  function normalize(value){const key=String(value||'').trim().toLowerCase().replace(/\s+/g,'-');return aliases[key]||key;}
  function emit(detail){window.dispatchEvent(new CustomEvent('kleenest:navigation-changed',{detail}));}
  function legacyActivate(view){
    const fn={home:window.home,maps:window.maps,details:window.details,route:window.route,profile:window.profile}[view];
    if(typeof fn==='function'){try{fn();return true;}catch(error){window.dispatchEvent(new CustomEvent('kleenest:action-error',{detail:{action:'navigation:'+view,error}}));}}
    if(typeof window.showPage==='function'){try{window.showPage(view);return true;}catch(error){window.dispatchEvent(new CustomEvent('kleenest:action-error',{detail:{action:'showPage:'+view,error}}));}}
    if(typeof window.navigate==='function'&&window.navigate!==activate){try{window.navigate(view);return true;}catch(error){window.dispatchEvent(new CustomEvent('kleenest:action-error',{detail:{action:'navigate:'+view,error}}));}}
    if(typeof window.render==='function'){
      try{
        if(typeof window.currentPage!=='undefined')window.currentPage=view;
        if(typeof window.activePage!=='undefined')window.activePage=view;
        window.render();
        return true;
      }catch(error){window.dispatchEvent(new CustomEvent('kleenest:action-error',{detail:{action:'render:'+view,error}}));}
    }
    return false;
  }
  function activate(rawView){
    const view=normalize(rawView);if(!view)return current;current=view;
    let foundView=false;
    document.querySelectorAll('[data-kleenest-view]').forEach(el=>{foundView=true;const active=normalize(el.dataset.kleenestView)===view;el.hidden=!active;el.setAttribute('aria-hidden',String(!active));});
    document.querySelectorAll('[data-kleenest-nav],[data-tab]').forEach(el=>{const target=el.dataset.kleenestNav||el.dataset.tab;const active=normalize(target)===view;el.classList.toggle('active',active);el.setAttribute('aria-current',active?'page':'false');});
    if(!foundView)legacyActivate(view);emit({view});return view;
  }
  function inferNavView(el){
    if(!el)return '';
    const direct=el.dataset?.kleenestNav||el.dataset?.tab||el.dataset?.page||el.dataset?.view||el.getAttribute('aria-label')||el.getAttribute('title');
    if(direct)return normalize(direct);
    const text=(el.textContent||'').trim().toLowerCase();
    for(const key of Object.keys(aliases))if(text===key||text.includes(key))return aliases[key];
    return '';
  }
  function init(){
    if(api._initialized)return;api._initialized=true;
    document.addEventListener('click',e=>{const el=e.target.closest?.('[data-kleenest-nav],[data-tab],.nav-btn,.bottom-btn,[data-page],[data-view]');if(!el)return;const view=inferNavView(el);if(!view)return;e.preventDefault();e.stopPropagation();activate(view);},true);
    const initial=document.querySelector('[data-kleenest-nav].active')?.dataset.kleenestNav||document.querySelector('[data-kleenest-nav],[data-tab].active')?.dataset.tab||document.querySelector('[data-kleenest-view]')?.dataset.kleenestView||'home';activate(initial);
  }
  api.activate=activate;api.current=()=>current;api.init=init;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
