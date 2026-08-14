/* Deprecated compatibility entry. The authoritative renderer is kleenest-app-shell.js. */
(function(){'use strict';
 if(window.KleenestAppShell?.render){window.KleenestAppShell.render();return;}
 if(document.querySelector('script[data-kleenest-shell]'))return;
 const s=document.createElement('script');s.src='kleenest-app-shell.js';s.dataset.kleenestShell='1';document.head.appendChild(s);
})();
