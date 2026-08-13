/* Consumer -> partner/business attribution boundary. Keeps business value tied to qualifying user activity. */
(function(){'use strict';
 const A=window.KleenestEngagementAttribution=window.KleenestEngagementAttribution||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Engagement attribution boundary unavailable');return api.rpc(name,args)};
 A.record=async({businessId,locationId,partnerNetworkId,campaignId,activityType,source,metadata={}}={})=>rpc('record_business_engagement_attribution',{p_business_id:businessId,p_location_id:locationId,p_partner_network_id:partnerNetworkId,p_campaign_id:campaignId,p_activity_type:activityType,p_source:source,p_metadata:metadata});
 A.consumerAction=async(action,ids={})=>{const result=await window.KleenestEngagement.performAction(action,ids);try{await A.record({businessId:ids.businessId,locationId:ids.locationId,partnerNetworkId:ids.partnerNetworkId,campaignId:ids.campaignId,activityType:action,source:ids.source||'consumer',metadata:{action_result:result}})}catch(_e){}return result};
 A.score=(m={})=>Math.round(Number(m.visits||0)*1+Number(m.check_ins||0)*4+Number(m.reviews||0)*3+Number(m.favorites||0)*2+Number(m.preferred_uses||0)*5+Number(m.access_redemptions||0)*6+Number(m.promotion_redemptions||0)*5);
 A.funnel=(m={})=>({visits:Number(m.visits||0),engaged:Number(m.check_ins||0)+Number(m.favorites||0)+Number(m.preferred_uses||0),converted:Number(m.access_redemptions||0)+Number(m.promotion_redemptions||0),advocacy:Number(m.reviews||0)});
 A.opportunities=(m={})=>{const f=A.funnel(m),r=[];if(f.visits&&!f.engaged)r.push('Convert discovery into check-in/favorite challenges');if(f.engaged&&!f.advocacy)r.push('Launch a review-quality reward');if(f.engaged&&!f.converted)r.push('Offer Preferred or single-use access');if(f.converted>0)r.push('Scale the highest-converting partner campaign');return r};
})();
