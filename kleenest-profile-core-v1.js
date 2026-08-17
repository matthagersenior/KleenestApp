/* Profile Core v1 compatibility entrypoint — no independent implementation. */
(function(g){'use strict';if(g.KleenestProfileCoreV1)return;g.KleenestProfileCoreV1={render:async function(root,user){var core=g.KleenestProfileCoreV2;if(!core?.render)throw new Error('Canonical Profile Core v2 unavailable.');return core.render(root,user)}}})(window);
