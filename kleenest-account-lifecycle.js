/* Account lifecycle bridge. Deletion remains an authenticated server-side operation. */
(function(){'use strict';
 const api=window.KleenestAccountLifecycle=window.KleenestAccountLifecycle||{};
 api.requestDeletion=async function(reason){if(!window.KleenestRuntime?.getSession)throw new Error('Authentication is unavailable.');const session=await window.KleenestRuntime.getSession();if(!session)throw new Error('Please sign in first.');if(!window.KleenestSupabase?.rpc)throw new Error('Account service is unavailable.');return window.KleenestSupabase.rpc('request_account_deletion',{p_reason:String(reason||'').slice(0,500)||null});};
 api.signOut=()=>window.KleenestRuntime?.signOut?.();
})();
