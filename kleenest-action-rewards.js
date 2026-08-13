/* Shared action -> reward orchestration. UI never supplies points; the server records qualifying activity. */
(function(){'use strict';
 const R=window.KleenestActionRewards=window.KleenestActionRewards||{};
 const activity=window.KleenestGamification?.recordActivity;
 const fire=async(type,metadata={})=>{if(typeof activity!=='function')throw new Error('Gamification activity boundary unavailable');return activity(type,metadata)};
 R.checkIn=(locationId,meta={})=>fire('check_in',{location_id:locationId,...meta});
 R.review=(locationId,reviewId,meta={})=>fire('review',{location_id:locationId,review_id:reviewId,...meta});
 R.helpfulReview=(reviewId)=>fire('community_helpful',{review_id:reviewId});
 R.favorite=(locationId)=>fire('favorite_location',{location_id:locationId});
 R.follow=(userId)=>fire('follow_user',{user_id:userId});
 R.routeStop=(routeId,stopId)=>fire('route_stop_completed',{route_id:routeId,stop_id:stopId});
 R.routeComplete=(routeId)=>fire('route_completed',{route_id:routeId});
 R.promotion=(promotionId,locationId)=>fire('promotion_redeemed',{promotion_id:promotionId,location_id:locationId});
 R.preferredUse=(locationId)=>fire('preferred_use',{location_id:locationId});
 R.share=(kind,id)=>fire('share',{kind,id});
 R.businessEngagement=(kind,id)=>fire('business_engagement',{kind,id});
 R.contestEntry=(contestId)=>fire('contest_entry',{contest_id:contestId});
 R.familyInvite=(familyMemberId)=>fire('family_invite',{family_member_id:familyMemberId});
})();
