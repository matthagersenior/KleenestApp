/* Safe app-shell enhancements. Does not cache authenticated/API responses. */
(function(){'use strict';
 const api=window.KleenestAppShell=window.KleenestAppShell||{};
 api.install=()=>{if(!('serviceWorker' in navigator))return false;if(location.protocol!=='https:'&&location.hostname!=='localhost')return false;return navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(()=>true).catch(e=>{console.warn('Kleenest offline shell unavailable:',e);return false;});};
 api.installManifest=()=>{if(document.querySelector('link[rel="manifest"]'))return;const l=document.createElement('link');l.rel='manifest';l.href='/manifest.webmanifest';document.head.appendChild(l);};
 api.installManifest();window.addEventListener('load',()=>api.install());
})();
