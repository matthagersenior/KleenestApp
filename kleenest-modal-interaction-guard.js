/* Canonical modal interaction controller: backdrop/explicit-close only. Form controls never dismiss modals. */
(function(){'use strict';
  const G=window.KleenestModalGuard=window.KleenestModalGuard||{};
  const MODAL='.modal-overlay,.modal-box,[role="dialog"],.auth-modal,.login-modal,.signup-modal,[data-auth-modal]';
  const CONTROL='input,textarea,select,button,label,a,form,[contenteditable="true"]';
  const CLOSE='[data-explicit-close],[data-modal-close],.modal-close,.auth-modal-close';
  function protect(e){
    const modal=e.target?.closest?.(MODAL);
    if(!modal)return;
    const control=e.target?.closest?.(CONTROL);
    if(control && modal.contains(control)){
      e.stopImmediatePropagation();
      return;
    }
    const explicit=e.target?.closest?.(CLOSE);
    if(explicit && modal.contains(explicit))return;
    if(modal.classList.contains('modal-overlay') && e.target===modal)return;
    e.stopImmediatePropagation();
  }
  function install(root=document){
    if(G.installed)return;
    G.installed=true;
    const target=root===document?window:root;
    ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click'].forEach(type=>target.addEventListener(type,protect,true));
  }
  G.install=install;
  G.enhance=()=>document.querySelectorAll(MODAL).forEach(modal=>{
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{install();G.enhance();},{once:true});
  else {install();G.enhance();}
})();
