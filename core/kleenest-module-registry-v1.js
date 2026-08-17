/* Kleenest Module Registry v1 - canonical module lifecycle authority */
(function(g){'use strict';
if(g.KleenestModuleRegistryV1)return;
const modules=new Map();
function register(module){
 if(!module||!module.name) throw new Error('Module name required');
 modules.set(module.name,module);
 return module;
}
function get(name){return modules.get(name)}
async function mount(name,container,context={}){
 const mod=get(name);
 if(!mod) throw new Error('Module not registered: '+name);
 if(typeof mod.mount!=='function') throw new Error('Module mount missing: '+name);
 return mod.mount(container,context);
}
function unmount(name){
 const mod=get(name);
 return mod?.unmount?.();
}
function health(){
 return Array.from(modules.values()).map(m=>({name:m.name,version:m.version||'unknown',status:typeof m.health==='function'?m.health():'registered'}));
}
g.KleenestModuleRegistryV1={register,get,mount,unmount,health,list:()=>Array.from(modules.keys())};
})(window);