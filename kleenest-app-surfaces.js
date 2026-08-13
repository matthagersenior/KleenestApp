/* Modular application surface registry. Each surface declares its domain dependencies and lifecycle hooks. */
(function(){'use strict';
 const S=window.KleenestSurfaces=window.KleenestSurfaces||{};
 const defs={
  home:{path:'#home',deps:['KleenestRuntime','KleenestCommunity','KleenestGamification']},
  maps:{path:'#maps',deps:['KleenestRuntime','KleenestBusinessData']},
  details:{path:'#details',deps:['KleenestRuntime','KleenestBusinessData','KleenestSocial']},
  profile:{path:'#profile',deps:['KleenestRuntime','KleenestSocial','KleenestGamification']},
  business:{path:'#business',deps:['KleenestRuntime','KleenestBusinessData','KleenestPartnershipUI']},
  admin:{path:'#admin',deps:['KleenestRuntime','KleenestBusinessData','KleenestAccountLifecycle']},
  community:{path:'#community',deps:['KleenestRuntime','KleenestCommunity','KleenestSocial','KleenestGamification']}
 };
 S.definitions=Object.freeze(defs);
 S.dependenciesReady=name=>{const d=defs[name];return !!d&&d.deps.every(dep=>window[dep]);};
 S.status=()=>Object.fromEntries(Object.keys(defs).map(name=>[name,{ready:S.dependenciesReady(name),deps:defs[name].deps}]));
 S.mount=(name,root=document)=>{if(!S.dependenciesReady(name))throw new Error(`Surface dependencies unavailable: ${name}`);const node=root.querySelector(defs[name].path);if(node)node.dataset.kleenestSurface=name;return node};
 S.allReady=()=>Object.keys(defs).every(S.dependenciesReady);
})();
