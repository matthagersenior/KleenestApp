/* Canonical Tab Core Registry v1 — exactly one lifecycle owner per application tab. */
(function(g){'use strict';if(g.KleenestTabCoreRegistryV1)return;
const specs={
 home:()=>import('../cores/home/home-core.js?tabcore=17'),
 maps:()=>import('../cores/maps/maps-tab-core.js?tabcore=17'),
 social:()=>import('../cores/social/social-tab-core.js?tabcore=17'),
 profile:()=>import('../cores/profile/profile-core.js?tabcore=17'),
 business:()=>import('../cores/business/business-core.js?tabcore=17'),
 admin:()=>import('../cores/admin/admin-core.js?tabcore=17')
};
const instances=new Map();
const pending=new Map();
async function mount(name,container,context={}){
 const load=specs[name];
 if(!load)throw new Error('No canonical tab core: '+name);
 const existing=instances.get(name);
 if(existing){
   if(existing.container===container)return existing.cleanup;
   throw new Error('Canonical tab core already mounted: '+name);
 }
 const inFlight=pending.get(name);
 if(inFlight){
   const mounted=await inFlight;
   if(mounted.container!==container)throw new Error('Canonical tab core mount already in progress: '+name);
   return mounted.cleanup;
 }
 const operation=(async()=>{
   const mod=await load();
   const factory=mod.createHomeCore||mod.createMapsCore||mod.createSocialCore||mod.createProfileCore||mod.createBusinessCore||mod.createAdminCore;
   if(typeof factory!=='function')throw new Error('Canonical tab core factory missing: '+name);
   const core=await factory({root:container,user:context.user||null,supabase:g.KleenestSupabaseClient});
   await core.mount();
   let released=false;
   const release=async()=>{
     if(released)return;
     released=true;
     try{await core.destroy?.();}finally{instances.delete(name);}
   };
   const mounted={name,container,core,cleanup:release};
   instances.set(name,mounted);
   return mounted;
 })();
 pending.set(name,operation);
 try{return (await operation).cleanup;}finally{pending.delete(name);}
}
function unmount(name){return instances.get(name)?.cleanup?.()||Promise.resolve();}
function get(name){return instances.get(name)?.core||null;}
for(const name of Object.keys(specs)){g.KleenestModuleRegistryV1.register({name,version:'canonical-v1',mount:(container,context)=>mount(name,container,context)});}
g.KleenestTabCoreRegistryV1={tabs:Object.freeze(Object.keys(specs)),mount,unmount,get};})(window);