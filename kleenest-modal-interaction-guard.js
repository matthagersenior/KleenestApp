/* Canonical modal interaction controller: backdrop/explicit-close only. Form controls never dismiss modals. */
(function(){'use strict';
  const G=window.KleenestModalGuard=window.KleenestModalGuard||{};
  const MODAL='.modal-overlay,.modal-box,[role="dialog"],.auth-modal,.login-modal,.signup-modal,[data-auth-modal]';
  const INPUT_CONTROL='input,textarea,select,[contenteditable="true"]';
  const CLOSE='[data-explicit-close],[data-modal-close],.modal-close,.auth-modal-close';

  function normalizeOverlay(overlay){
    if(!overlay || !overlay.classList?.contains('modal-overlay')) return;
    // The legacy close handler uses closest('[data-close-modal]'). If that
    // attribute lives on the overlay, every click inside the modal matches it
    // through the ancestor chain and can dismiss the window. The overlay itself
    // is sufficient for backdrop semantics; explicit close controls keep their
    // own close attributes.
    overlay.removeAttribute('data-close-modal');
  }

  function enhance(root=document){
    root.querySelectorAll?.('.modal-overlay').forEach(normalizeOverlay);
    root.querySelectorAll?.(MODAL).forEach(modal=>{
      modal.setAttribute('role','dialog');
      modal.setAttribute('aria-modal','true');
    });
  }

  function protect(e){
    const target=e.target;
    const modal=target?.closest?.(MODAL);
    if(!modal)return;

    const explicit=target?.closest?.(CLOSE);
    if(explicit && modal.contains(explicit))return;

    // Backdrop is the only implicit close target.
    if(modal.classList.contains('modal-overlay') && target===modal){
      modal.remove();
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    // Form fields must never bubble into legacy overlay-close logic.
    const field=target?.closest?.(INPUT_CONTROL);
    if(field && modal.contains(field)){
      e.stopImmediatePropagation();
    }
  }

  function install(root=document){
    if(G.installed)return;
    G.installed=true;
    const target=root===document?window:root;
    ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click'].forEach(type=>target.addEventListener(type,protect,true));

    enhance(root);
    const observer=new MutationObserver(mutations=>{
      for(const mutation of mutations){
        for(const node of mutation.addedNodes){
          if(node.nodeType===1) enhance(node);
        }
        if(mutation.type==='attributes' && mutation.target?.nodeType===1){
          normalizeOverlay(mutation.target);
        }
      }
    });
    observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['data-close-modal']});
    G.observer=observer;
  }

  G.install=install;
  G.enhance=enhance;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>install(),{once:true});
  else install();
})();