/* Persistent feature registry for the authoritative modular runtime. Modules are loaded only when their surface is opened. */
(function(){'use strict';
 if(window.KleenestFeatureRegistry)return;
 const registry={
  auth:'kleenest-auth-launcher.js',
  maps:'kleenest-map-discovery.js',
  social:'kleenest-social.js',
  engagement:'kleenest-engagement.js',
  rewards:'kleenest-rewards.js',
  games:'kleenest-game-center.js',
  qr:'kleenest-qr.js',
  business:'kleenest-business-workspace.js',
  businessAnalytics:'kleenest-business-analytics.js',
  businessAdvanced:'kleenest-business-advanced-controls.js',
  admin:'kleenest-admin-surface.js',
  media:'kleenest-media.js'
 };
 const loaded={};
 function load(name){
  const src=registry[name];
  if(!src)return Promise.reject(new Error('Unknown Kleenest feature: '+name));
  if(loaded[name]||document.querySelector('script[data-kleenest-feature="'+name+'"]')){loaded[name]=true;return Promise.resolve();}
  return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src+'?modular=20260815';s.dataset.kleenestFeature=name;s.onload=()=>{loaded[name]=true;resolve()};s.onerror=()=>reject(new Error('Unable to load '+name));document.head.appendChild(s)});
 }
 window.KleenestFeatureRegistry={registry,loaded,load,loadMany:names=>Promise.all(names.map(load))};
})();
