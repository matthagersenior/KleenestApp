/* Global modal interaction guard: only the backdrop or explicit close controls may dismiss a modal. */
(function(){'use strict';
 const G=window.KleenestModalGuard=window.KleenestModalGuard||{};
 G.install=function(root=document){if(root.__kleenestModalGuard)return;root.__kleenestModalGuard=true;
   root.addEventListener('click',function(e){
     const overlay=e.target.closest?.('.modal-overlay');
     if(!overlay)return;
     const explicit=e.target.closest?.('[data-close-modal]');
     if(explicit && !explicit.classList.contains('modal-overlay'))return;
     if(e.target===overlay){overlay.remove();return;}
     e.stopPropagation();
   },true);
   root.addEventListener('pointerdown',function(e){
     const overlay=e.target.closest?.('.modal-overlay');
     if(overlay && e.target!==overlay)e.stopPropagation();
   },true);
   root.addEventListener('mousedown',function(e){
     const overlay=e.target.closest?.('.modal-overlay');
     if(overlay && e.target!==overlay)e.stopPropagation();
   },true);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>G.install());else G.install();
})();
