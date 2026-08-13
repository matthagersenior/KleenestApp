/* Mobile auth-modal interaction guard.
   Keeps form controls from being interpreted as backdrop taps and adds
   keyboard/focus behavior expected from a production authentication dialog.
*/
(function(){'use strict';
 const interactive='input,textarea,select,button,label,a,[contenteditable="true"]';
 const dialogs='.modal-overlay,.modal-box,[role="dialog"],.auth-modal,.login-modal,.signup-modal';
 function closest(el,sel){return el&&el.closest?el.closest(sel):null;}
 function dialog(el){return !!closest(el,dialogs);}
 function control(el){return !!closest(el,interactive);}
 function protect(e){if(dialog(e.target)&&control(e.target))e.stopPropagation();}
 ['pointerdown','pointerup','touchstart','touchend','click'].forEach(type=>document.addEventListener(type,protect,true));
 document.addEventListener('click',function(e){
  const overlay=closest(e.target,'.modal-overlay');
  if(overlay && e.target===overlay){return;}
  if(dialog(e.target))e.stopPropagation();
 },true);
 function enhance(){
  document.querySelectorAll(dialogs).forEach(d=>{
   if(!d.hasAttribute('role'))d.setAttribute('role','dialog');
   if(!d.hasAttribute('aria-modal'))d.setAttribute('aria-modal','true');
   if(!d.hasAttribute('tabindex'))d.setAttribute('tabindex','-1');
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
 new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});
 window.kleenestAuthModalTouchFix={installed:true,enhance};
})();
