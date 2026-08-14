/* Auth modal hardening: form controls never trigger the backdrop close path. */
(function(){'use strict';
  const fields='input,textarea,select,[contenteditable="true"]';
  const dialogs='.modal-overlay,.modal-box,[role="dialog"],.auth-modal,.login-modal,.signup-modal,[data-auth-modal]';

  function enhance(root=document){
    root.querySelectorAll?.(dialogs).forEach(dialog=>{
      dialog.setAttribute('role','dialog');
      dialog.setAttribute('aria-modal','true');
      dialog.querySelectorAll?.('input[type="password"]').forEach(input=>{
        input.minLength=8;
        if(/(^|\s)(at least )?6(\s+characters)?/i.test(input.placeholder||'')) input.placeholder='At least 8 characters';
      });
      if(dialog.classList.contains('modal-overlay')) dialog.removeAttribute('data-close-modal');
    });
  }

  function protect(e){
    const field=e.target?.closest?.(fields);
    if(!field || !field.closest?.(dialogs)) return;
    // Capture-phase protection prevents the legacy document-level close delegate from
    // seeing a form-field interaction. Buttons/tabs are deliberately not intercepted.
    e.stopPropagation();
  }

  ['pointerdown','mousedown','touchstart','click'].forEach(type=>
    document.addEventListener(type,protect,true)
  );

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>enhance(),{once:true});
  else enhance();
  new MutationObserver(()=>enhance()).observe(document.documentElement,{childList:true,subtree:true});
  window.kleenestAuthModalTouchFix={installed:true,enhance,protect};
})();
