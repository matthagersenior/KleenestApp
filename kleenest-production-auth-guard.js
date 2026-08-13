/* Production auth guard: protects server-backed actions while legacy UI is migrated. */
(function(){'use strict';
 const protectedSelectors='[data-requires-auth], [data-action="checkin"], [data-action="redeem"], [data-action="reply-review"]';
 document.addEventListener('click',async e=>{const el=e.target.closest?.(protectedSelectors);if(!el)return;if(window.KleenestRuntime?.getSession){try{const s=await window.KleenestRuntime.getSession();if(s)return;}catch(_){}e.preventDefault();e.stopImmediatePropagation();window.dispatchEvent(new CustomEvent('kleenest:auth-required',{detail:{element:el}}));}},true);
 window.kleenestProductionAuthGuard={installed:true};
})();
