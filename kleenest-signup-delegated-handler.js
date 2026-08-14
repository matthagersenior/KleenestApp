/* Delegated signup bridge. Handles both real forms and the legacy div-based auth panel. */
(function(){'use strict';const A=window.KleenestSignupDelegated=window.KleenestSignupDelegated||{};
 function dialog(el){return el?.closest?.('.modal-overlay,.modal-box,[role="dialog"],.auth-modal,.login-modal,.signup-modal,[data-auth-modal]');}
 function signupPanel(el){const d=dialog(el);return !!(d&&(/sign.?up|create account|register/i.test(d.textContent||'')||d.querySelector('[data-auth-tab="signup"].active,#signup-tab.active,[data-auth-panel="signup"]')));}
 function values(root){return{email:root.querySelector?.('[name="email"],input[type="email"],#su-email')?.value?.trim(),password:root.querySelector?.('[name="password"],input[type="password"],#su-pass')?.value||'',name:root.querySelector?.('[name="display_name"],[name="displayName"],[name="name"],#su-name')?.value?.trim()||'',username:root.querySelector?.('[name="username"]')?.value?.trim()||''};}
 async function submit(root,e){const f=values(root);if(!f.email&&!f.password)return false;e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();try{const data=await window.KleenestAuthSignup.submit({email:f.email,password:f.password,metadata:{display_name:f.name,username:f.username},demo:true});root.dispatchEvent(new CustomEvent('kleenest:signup-success',{bubbles:true,detail:{data}}));return true;}catch(error){root.dispatchEvent(new CustomEvent('kleenest:signup-form-error',{bubbles:true,detail:{error}}));return true;}}
 A.bind=()=>{if(A.bound)return;A.bound=true;
   window.addEventListener('click',async e=>{const button=e.target?.closest?.('[data-do-signup],[data-action="signup"],[data-signup]');if(!button||!signupPanel(button))return;await submit(dialog(button),e);},true);
   window.addEventListener('submit',async e=>{const form=e.target?.closest?.('form');if(!form||!signupPanel(form))return;await submit(form,e);},true);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',A.bind,{once:true});else A.bind();})();
