/* Mobile auth-modal touch guard.
   Interactive controls inside an auth dialog must not become backdrop taps.
   Capture-phase protection handles dynamically-created dialogs and touch/pointer
   activation without changing intentional backdrop dismissal.
*/
(function(){'use strict';
 const interactive='input,textarea,select,button,label,a,[contenteditable="true"]';
 const dialogs='.modal-overlay,.modal-box,[role="dialog"],.auth-modal,.login-modal,.signup-modal';
 function dialog(el){return !!(el&&el.closest&&el.closest(dialogs));}
 function control(el){return !!(el&&el.closest&&el.closest(interactive));}
 function protect(e){if(dialog(e.target)&&control(e.target))e.stopPropagation();}
 ['pointerdown','pointerup','touchstart','touchend','click'].forEach(type=>document.addEventListener(type,protect,true));
 window.kleenestAuthModalTouchFix={installed:true};
})();
