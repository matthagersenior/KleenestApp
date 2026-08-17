/* Canonical Tab Core Registry v1 — exactly one lifecycle owner per application tab. */
(function(g){'use strict';if(g.KleenestTabCoreRegistryV1)return;
const specs={
 home:()=>import('../cores/home/home-core.js?tabcore=16'),
 maps:()=>import('../cores/maps/maps-tab-core.js?tabcore=16'),
 social:()=>import('../cores/social/social-tab-core.js?tabcore=16'),
 profile:()=>import('../cores/profile/profile-core.js?tabcore=16'),
 business:()=>import('../cores/business/business-core.js?tabcore=16'),
 admin:()=>import('../cores/admin/admin-core.js?tabcore=16')
};
async function mount(name,container,context={}){const load=specs[name];if(!load)throw new Error('No canonical tab core: '+name);const mod=await load();const factory=mod.createHomeCore||mod.createMapsCore||mod.createSocialCore||mod.createProfileCore||mod.createBusinessCore||mod.createAdminCore;if(typeof factory!=='function')throw new Error('Canonical tab core factory missing: '+name);const core=await factory({root:container,user:context.user||null,supabase:g.KleenestSupabaseClient});const cleanup=await core.mount();return typeof cleanup==='function'?cleanup:()=>core.destroy?.()}
for(const name of Object.keys(specs)){g.KleenestModuleRegistryV1.register({name,version:'canonical-v1',mount:(container,context)=>mount(name,container,context)});}
g.KleenestTabCoreRegistryV1={tabs:Object.freeze(Object.keys(specs)),mount};})(window);
