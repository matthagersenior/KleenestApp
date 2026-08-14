/* Production auth-modal interaction and validation guard. Never cancel native form-control focus. */
(function(){'use strict';
 const interactive='input,textarea,select,button,label,a,[contenteditable="true"],form';
 const dialogs='.modal-overlay,.modal-box,[role="dialog"],.auth-modal,.login-modal,.signup-modal,[data-auth-modal]';
 function closest(el,sel){return el&&el.closest?el.closest(sel):null;}
 function protect(e){const d=closest(e.target,dialogs);if(!d)return;const c=closest(e.target,interactive);if(c&&d.contains(c)){e.stopImmediatePropagation();e.stopPropagation();return;}if(e.target!==d&&!closest(e.target,'[data-close-modal]')){e.stopImmediatePropagation();e.stopPropagation();}}
 ['pointerdown','pointerup','touchstart','touchend','mousedown','mouseup','click'].forEach(type=>document.addEventListener(type,protect,true));
 function enhance(){document.querySelectorAll(dialogs).forEach(d=>{d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('tabindex','-1');d.querySelectorAll(interactive).forEach(c=>{c.dataset.modalInterior='true';});d.querySelectorAll('input[type="password"]').forEach(p=>{if(/(^|\s)(at least )?6(\s+characters)?/i.test(p.placeholder||''))p.placeholder='At least 8 characters';p.minLength=8;});});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
 new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});
 window.kleenestAuthModalTouchFix={installed:true,enhance};
})();