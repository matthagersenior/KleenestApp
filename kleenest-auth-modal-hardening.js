/* Definitive auth modal interaction guard. Capture at window so legacy document handlers cannot dismiss forms. */
(function(){'use strict';
 const A=window.KleenestAuthModalHardening=window.KleenestAuthModalHardening||{};
 const MODAL='.modal-overlay,.modal-box,[role="dialog"],.auth-modal,.login-modal,.signup-modal,[data-auth-modal]';
 const CONTROL='input,textarea,select,button,label,a,[contenteditable="true"]';
 const protectedEvent=(e)=>{const modal=e.target?.closest?.(MODAL);if(!modal)return;const control=e.target?.closest?.(CONTROL);if(control&&modal.contains(control)){e.stopImmediatePropagation();return;}if(modal.classList.contains('modal-overlay')&&e.target===modal)return;const explicitClose=e.target?.closest?.('[data-explicit-close],[data-modal-close],.modal-close,.auth-modal-close');if(!explicitClose)e.stopImmediatePropagation();};
 if(!window.__kleenestAuthWindowGuard){window.__kleenestAuthWindowGuard=true;['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click'].forEach(type=>window.addEventListener(type,protectedEvent,true));}
 A.enhance=()=>document.querySelectorAll(MODAL).forEach(modal=>{modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');if(modal.matches('.auth-modal,.login-modal,.signup-modal'))modal.dataset.authModal='true';});
 A.openSignUp=()=>{const modal=document.querySelector('[data-auth-modal],.auth-modal,.login-modal,.signup-modal');if(modal){const tab=modal.querySelector('[data-auth-tab="signup"],#signup-tab,[data-tab="signup"]');if(tab)tab.dispatchEvent(new MouseEvent('click',{bubbles:true}));return modal;}window.dispatchEvent(new CustomEvent('kleenest:open-auth',{detail:{mode:'signup'}}));return null;};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',A.enhance,{once:true});else A.enhance();
 new MutationObserver(A.enhance).observe(document.documentElement,{childList:true,subtree:true});
})();
