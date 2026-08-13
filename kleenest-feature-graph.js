/* Cross-surface feature graph: one activity graph connects discovery, route, community, profile and business value. */
(function(){'use strict';
 const X=window.KleenestFeatureGraph=window.KleenestFeatureGraph||{};
 const rewards=()=>window.KleenestActionRewards;
 X.mapDiscovery=(location)=>({location,details:window.KleenestMaps?.prepareDetails?.(location),community:true,route:true,game:true});
 X.detailsActions=(location)=>({favorite:(id)=>rewards()?.favorite(id),checkIn:(id,meta)=>rewards()?.checkIn(id,meta),review:(id,reviewId,meta)=>rewards()?.review(id,reviewId,meta),route:(id)=>({locationId:id,available:true}),community:{enabled:true},game:{enabled:true}});
 X.routeActions=(routeId)=>({complete:()=>window.KleenestRoute?.complete?.(routeId),stop:(stopId)=>rewards()?.routeStop(routeId,stopId),finish:()=>rewards()?.routeComplete(routeId),share:()=>rewards()?.share('route',routeId),community:true,contests:true});
 X.communityActions=(kind,id)=>({share:()=>rewards()?.share(kind,id),follow:userId=>rewards()?.follow(userId),helpfulReview:reviewId=>rewards()?.helpfulReview(reviewId),profile:true,details:true,contests:true});
 X.profileDestinations=()=>({maps:true,route:true,community:true,details:true,favorites:true,family:true,game:true});
 X.businessValue=(businessId)=>({growth:window.KleenestBusinessGrowth?.getGrowthSnapshot,analytics:window.KleenestBusinessIntelligence?.getDashboard,enterprise:window.KleenestFleetEnterprise,access:window.KleenestSingleUseAccess,partnerships:window.KleenestPartnershipAccess,community:true,consumerEngagement:true});
 X.adminDestinations=()=>({business:true,enterprise:true,community:true,moderation:true,verification:true});
 X.premiumValue=()=>({points:true,badges:true,streaks:true,contests:true,games:true,rewards:true,favorites:true,family:true,following:true,likedReviews:true,routeChallenges:true,partnerAccess:true});
})();
