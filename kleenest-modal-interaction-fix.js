/* Modal interaction guard: backdrop close attributes belong to the backdrop, not its dialog. */
(function(){'use strict';
 const ATTRS=['data-close-modal','data-close-family'];
 function guard(e){
   const box=e.target?.closest?.('.modal-box');
   if(!box)return;
   const overlay=box.closest?.('.modal-overlay');
   if(!overlay)return;
   const removed=[];
   for(const attr of ATTRS){
     if(overlay.hasAttribute(attr)){removed.push(attr);overlay.removeAttribute(attr);}
   }
   if(!removed.length)return;
   // Restore after the current click has completely propagated so the legacy
   // document-level close handler cannot interpret an inside click as a backdrop click.
   setTimeout(()=>{for(const attr of removed)overlay.setAttribute(attr,'');},0);
 }
 document.addEventListener('click',guard,true);
 document.addEventListener('pointerdown',guard,true);
 window.KleenestModalInteractionFix={guard};
})();
