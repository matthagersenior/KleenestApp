/* Post-auth provisioning bridge. Shared client owns the actual provisioning flow. */
(function(){'use strict';
 async function provision(){if(!window.KleenestSupabase?.provision)throw new Error('Supabase provisioning is not ready.');return window.KleenestSupabase.provision();}
 async function afterAuth(){try{return await provision();}catch(error){console.error('Post-auth provisioning failed:',error);throw error;}}
 window.kleenestAuthProvision={provision,afterAuth};
})();
