/* Canonical modal interaction controller: backdrop/explicit-close only. Form controls never dismiss modals. */
(function(){'use strict';
  const G=window.KleenestModalGuard=window.KleenestModalGuard||{};
  const MODAL='.modal-overlay,.modal-box,[role="dialog"],.auth-modal,.login-modal,.signup-modal,[data-auth-modal]';
  // Only protect controls whose pointer/click interaction has no delegated app action of its own.
  // Buttons/links/forms must remain event-active because the app uses document-level delegation.
  const INPUT_CONTROL='input,textarea,select,[contenteditable="true"]';
  const CLOSE='[data-explicit-close],[data-modal-close],.modal-close,.auth-modal-close';
  function protect(e){
    const target=e.target;
    const modal=target?.closest?.(MODAL);
    if(!modal)return;

    // Explicit close controls and backdrop clicks must remain functional.
    const explicit=target?.closest?.(CLOSE);
    if(explicit && modal.contains(explicit))return;
    if(modal.classList.contains('modal-overlay') && target===modal)return;

    // Prevent legacy overlay/document close handlers from seeing direct form-field
    // interactions. Do NOT intercept buttons, links, or forms because those are
    // handled by the app's delegated click handler (tabs, submit, cancel, etc.).
    const field=target?.closest?.(INPUT_CONTROL);
    if(field && modal.contains(field)){
      e.stopImmediatePropagation();
      return;
    }
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
