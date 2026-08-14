/* Platform-neutral application boundary for web + future iOS/Android shells. */
(function(){'use strict';
 const P=window.KleenestPlatform=window.KleenestPlatform||{};
 P.version='1.0';
 P.platform=()=>window.Capacitor?.getPlatform?.()||'web';
 P.isNative=()=>['ios','android'].includes(P.platform());
 P.navigate=view=>window.KleenestNavigation?.activate?.(view)||window.dispatchEvent(new CustomEvent('kleenest:navigation-changed',{detail:{view}}));
 P.activity=(type,payload={})=>window.KleenestSurfaceActions?.recordActivity?.(type,payload);
 P.reward=(type,payload={})=>window.KleenestSurfaceActions?.reward?.(type,payload);
 P.storage={get:key=>{try{return JSON.parse(localStorage.getItem('kleenest:'+key));}catch{return null;}},set:(key,value)=>localStorage.setItem('kleenest:'+key,JSON.stringify(value))};
 P.demo={enabled:()=>sessionStorage.getItem('kleenest:demo')==='1',enable:()=>sessionStorage.setItem('kleenest:demo','1'),disable:()=>sessionStorage.removeItem('kleenest:demo')};
 P.capabilities=()=>({platform:P.platform(),native:P.isNative(),offlineStorage:true,push:!!window.KleenestNotifications,maps:!!window.KleenestLocation,auth:!!window.KleenestAuth,analytics:!!window.KleenestBusinessAnalytics,rewards:!!window.KleenestActionRewards});
})();
