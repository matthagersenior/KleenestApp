/* Critical auth shield. The legacy modal uses data-close-modal on the backdrop; never let descendants inherit that close action. */
(function(){'use strict';
 const controls='input,textarea,select,button,label,a,[contenteditable="true"]';
 const isDialog=e=>e.target?.closest?.('.modal-overlay,.modal-box,[role="dialog"],[data-auth-modal],.auth-modal,.login-modal,.signup-modal');
 const isControl=e=>e.target?.closest?.(controls);
 ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click'].forEach(type=>{
   document.addEventListener(type,e=>{
     const dialog=isDialog(e); if(!dialog || !isControl(e)) return;
     /* Stop the document-bubble handler that historically interpreted the backdrop's
        data-close-modal attribute as a close request for every descendant click. */
     e.stopPropagation();
   },true);
 });
 window.KleenestAuthInteractionShield={version:'1.0.0'};
})();
