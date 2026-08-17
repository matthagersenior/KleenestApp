/* Kleenest Surface Bridge v1 - canonical module surface mounting layer */
(function(g){'use strict';
  if(g.KleenestSurfaceBridgeV1)return;
  const mounts={};
  function register(name,adapter){
    if(!name||!adapter||typeof adapter.mount!=='function') throw new Error('Invalid surface adapter');
    mounts[name]=adapter;
    return adapter;
  }
  async function mount(name,container,context){
    const adapter=mounts[name];
    if(!adapter) throw new Error('Surface unavailable: '+name);
    if(!container) throw new Error('Missing surface container: '+name);
    return adapter.mount(container,context||{});
  }
  function health(){
    return Object.keys(mounts).map(name=>({name,healthy:typeof mounts[name].health==='function'?!!mounts[name].health():true}));
  }
  g.KleenestSurfaceBridgeV1={register,mount,health};
})(window);
