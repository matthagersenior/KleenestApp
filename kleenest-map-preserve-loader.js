/* Ensure map state preservation is active before discovery. */
(function(){'use strict';function start(){window.KleenestMapStatePreserver?.snapshot?.();window.dispatchEvent(new CustomEvent('kleenest:map-state-preserver-ready'));}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();})();
