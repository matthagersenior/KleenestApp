/* Keep implementation terminology out of the customer-facing brand and ensure durable media is available. */
(function(){'use strict';
 const style=document.createElement('style');
 style.textContent='header .brand small{display:none!important}';
 document.head.appendChild(style);
 if(!window.KleenestMedia){
   const s=document.createElement('script');
   s.src='kleenest-media.js';
   s.async=false;
   document.head.appendChild(s);
 }
})();