/* Production-shell regression contract: the thin index must load the modular runtime. */
(function(){'use strict';
 const required=['kleenest-ui-integration.js'];
 const html=document.documentElement?.outerHTML||'';
 for(const src of required)if(!html.includes(src))throw new Error('Modular shell missing '+src);
 window.addEventListener('kleenest:module-health',e=>{if(e.detail?.core!=='ready')console.error('Modular core failed to load',e.detail);});
 window.addEventListener('kleenest:modular-surfaces-ready',()=>document.documentElement.dataset.kleenestModularReady='true',{once:true});
})();
