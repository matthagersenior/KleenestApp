/* Mobile auth-modal touch fix.
   Inputs/buttons inside an open modal must not be treated as backdrop taps.
   Capture phase prevents legacy document/backdrop click handlers from closing
   the auth modal when the user taps an input on touch devices.
*/
(function(){'use strict';
 function isInteractive(el){return !!(el&&el.closest&&el.closest('input,textarea,select,button,label,a,[contenteditable="true"]'));}
 function isModal(el){return !!(el&&el.closest&&el.closest('.modal-overlay,.modal-box,[role="dialog"]'));}
 document.addEventListener('pointerdown',function(e){if(isModal(e.target)&&isInteractive(e.target))e.stopPropagation();},true);
 document.addEventListener('pointerup',function(e){if(isModal(e.target)&&isInteractive(e.target))e.stopPropagation();},true);
 document.addEventListener('click',function(e){if(isModal(e.target)&&isInteractive(e.target))e.stopPropagation();},true);
})();
