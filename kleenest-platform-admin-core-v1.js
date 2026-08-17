/* Legacy Admin Core v1 compatibility entrypoint.
 * Canonical Admin ownership lives in cores/admin/admin-core.js ->
 * kleenest-admin-canonical-runtime-v3.js -> kleenest-platform-admin-core-v2.js.
 * This file intentionally contains no independent Admin implementation.
 */
(function(g){'use strict';if(g.KleenestPlatformAdminCoreV1)return;var canonical=function(){return g.KleenestAdminCanonicalRuntimeV3||g.KleenestPlatformAdminCoreV2||null};g.KleenestPlatformAdminCoreV1={render:function(root){var c=canonical();if(!c||typeof c.render!=='function')throw Error('Canonical Admin Core unavailable.');return c.render(root)},mount:function(root){return this.render(root)},isAdmin:function(){var c=g.KleenestAdminCanonicalRuntimeV3;if(c&&typeof c.resolve==='function')return c.resolve().then(function(){return true}).catch(function(){return false});var v=g.KleenestPlatformAdminCoreV2;return v&&typeof v.isAdmin==='function'?v.isAdmin():false}};})(window);
