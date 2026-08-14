/* Auth modal hardening: protect form controls without intercepting their events. */
(function(){'use strict';
 const interactive='input,textarea,select,button,label,a,[contenteditable="true"],form';
 const dialogs='.modal-overlay,.modal-box,[role="dialog"],.auth-modal,.login-modal,.signup-modal,[data-auth-modal]';
 function enhance(){document.querySelectorAll(dialogs).forEach(d=>{
   d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true');
   d.querySelectorAll(interactive).forEach(c=>c.dataset.modalInterior='true');
   d.querySelectorAll('input[type="password"]').forEach(p=>{if(/(^|\s)(at least )?6(\s+characters)?/i.test(p.placeholder||''))p.placeholder='At least 8 characters';p.minLength=8;});
   // Remove the legacy close marker from the dialog container. Explicit close controls retain their own marker.
   if(d.hasAttribute('data-close-modal'))d.removeAttribute('data-close-modal');
 });}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
 new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});
 window.kleenestAuthModalTouchFix={installed:true,enhance};
})();