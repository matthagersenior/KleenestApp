/* Kleenest Module Adapter v1 — canonical shell/module lifecycle bridge */
(function(g){'use strict';
if(g.KleenestModuleAdapterV1)return;

const registry = g.KleenestModuleRegistryV1 || {
  modules:{},
  register(m){ this.modules[m.name]=m; },
  get(n){ return this.modules[n]; }
};

async function mount(name, container, context){
  const mod = registry.get(name);
  if(!mod) throw new Error('Module unavailable: '+name);
  if(typeof mod.mount !== 'function') throw new Error('Module mount missing: '+name);
  return await mod.mount(container, context || {});
}

function health(){
  return Object.keys(registry.modules || {}).map(name=>({name,status:'registered'}));
}

g.KleenestModuleAdapterV1={mount,health,registry};
})(window);
