/* Auth modal hardening: remove legacy overlay close semantics without intercepting UI events. */
(function(){'use strict';
 const A=window.KleenestAuthModalHardening=window.KleenestAuthModalHardening||{};
 const MODAL='.modal-overlay,.modal-box,[role="dialog"],.auth-modal,.login-modal,.signup-modal,[data-auth-modal]';
 function strip(node){let el=node;while(el&&el!==document.body){if(el.nodeType===1&&el.hasAttribute('data-close-modal'))el.removeAttribute('data-close-modal');el=el.parentElement;}}
 A.enhance=()=>document.querySelectorAll(MODAL).forEach(modal=>{modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');if(modal.matches('.auth-modal,.login-modal,.signup-modal'))modal.dataset.authModal='true';strip(modal);});
 A.openSignUp=()=>{const modal=document.querySelector('[data-auth-modal],.auth-modal,.login-modal,.signup-modal');if(modal){const tab=modal.querySelector('[data-auth-tab="signup"],#signup-tab,[data-tab="signup"]');if(tab)tab.click();return modal;}window.dispatchEvent(new CustomEvent('kleenest:open-auth',{detail:{mode:'signup'}}));return null;};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',A.enhance,{once:true});else A.enhance();
 new MutationObserver(A.enhance).observe(document.documentElement,{childList:true,subtree:true});
})();