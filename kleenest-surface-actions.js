/* Shared modular surface action bridge. Keeps cross-surface behavior out of index.html. */
(function(){'use strict';
 const S=window.KleenestSurfaceActions=window.KleenestSurfaceActions||{};
 const emit=(name,detail)=>window.KleenestEvents?.emit?window.KleenestEvents.emit(name,detail):window.dispatchEvent(new CustomEvent(name,{detail:detail||{}}));
 const go=view=>window.KleenestNavigation?.activate?window.KleenestNavigation.activate(view):emit('kleenest:navigation-changed',{view});
 S.openDetails=id=>{emit('kleenest:details-request',{restroomId:id});go('Details');};
 S.openMap=()=>go('Maps');
 S.openRoute=id=>{emit('kleenest:route-request',{restroomId:id});go('Route');};
 S.openProfile=id=>{emit('kleenest:profile-request',{userId:id});go('Profile');};
 S.openCommunity=()=>go('Social');
 S.openBusiness=id=>{emit('kleenest:business-request',{businessId:id});go('Business');};
 S.recordActivity=(type,payload={})=>emit('kleenest:activity',{type,payload,source:'surface'});
 S.reward=(type,payload={})=>{S.recordActivity(type,payload);return window.KleenestActionRewards?.dispatch?.(type,payload)||null;};
 S.bind=()=>{if(window.__kleenestSurfaceActionsBound)return;window.__kleenestSurfaceActionsBound=true;document.addEventListener('click',e=>{const el=e.target.closest?.('[data-restroom]');if(el&&!e.defaultPrevented){S.openDetails(el.dataset.restroom);return;}const tab=e.target.closest?.('[data-tab]');if(tab&&!e.defaultPrevented){go(tab.dataset.tab);}});};
 S.bind();
})();
