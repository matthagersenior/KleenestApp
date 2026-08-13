/* Premium engagement orchestration across the modular surfaces. */
(function(){'use strict';
 const E=window.KleenestPremiumEngagement=window.KleenestPremiumEngagement||{};
 E.context=async()=>({game:window.KleenestGame?.getState?.(),community:window.KleenestCommunity?.getSnapshot?.(),profile:window.KleenestProfile?.getSnapshot?.()});
 E.actions={checkIn:(id,m)=>window.KleenestActionRewards?.checkIn(id,m),review:(id,r,m)=>window.KleenestActionRewards?.review(id,r,m),routeComplete:id=>window.KleenestActionRewards?.routeComplete(id),share:(k,id)=>window.KleenestActionRewards?.share(k,id),contestEntry:id=>window.KleenestActionRewards?.contestEntry(id)};
 E.surfaceValue={home:['daily quests','leaderboards','contests','streaks'],maps:['discovery quests','favorite goals','check-in challenges'],route:['route challenges','completion rewards','team goals'],details:['review rewards','favorite goals','partner access'],profile:['levels','badges','streaks','social graph','family'],community:['contests','helpful-review reputation','leaderboards'],business:['customer engagement','campaign rewards','partner challenges'],admin:['reward integrity','contest oversight','engagement analytics']};
})();
