/* Delegated signup bridge for legacy/modular/demo markup. Keeps signup functional even when forms are generated dynamically. */
(function(){'use strict';
 const H=window.KleenestSignupDelegated=window.KleenestSignupDelegated||{};
 const isSignupForm=f=>f&&(f.matches('#signup-form,[id*="signup"],form[data-auth-mode="signup"],form[data-mode="signup"]')||/sign.?up/i.test(f.getAttribute('aria-label')||'')||/sign.?up/i.test(f.textContent||''));
 const field=(f,sel)=>f.querySelector(sel)?.value?.trim()||'';
 document.addEventListener('submit',async e=>{const f=e.target;if(!isSignupForm(f))return;e.preventDefault();e.stopImmediatePropagation();const email=field(f,'input[type="email"],[name="email"]');const password=field(f,'input[type="password"],[name="password"]');const confirm=field(f,'[name="confirmPassword"],[name="password_confirmation"],[data-confirm-password]');if(confirm&&confirm!==password){f.dispatchEvent(new CustomEvent('kleenest:signup-form-error',{detail:{message:'Passwords do not match.'},bubbles:true}));return;}try{const data=await window.KleenestAuthSignup.submit({email,password,metadata:{display_name:field(f,'[name="displayName"],[name="name"]')},demo:f.dataset.demoTest==='true'});f.dispatchEvent(new CustomEvent('kleenest:signup-form-success',{detail:{data},bubbles:true}));}catch(error){f.dispatchEvent(new CustomEvent('kleenest:signup-form-error',{detail:{error,message:error.message},bubbles:true}));}},true);
 document.addEventListener('click',e=>{const trigger=e.target.closest?.('[data-action="signup"],[data-auth="signup"],#signup-tab,.signup-tab,.signup-trigger');if(!trigger)return;e.preventDefault();e.stopPropagation();window.KleenestAuthSignup?.openSignUp?.();},true);
 H.version='1.0.0';
})();
