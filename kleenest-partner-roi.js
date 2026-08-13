/* Enterprise partner ROI + benchmarking orchestration. */
(function(){'use strict';
 const R=window.KleenestPartnerROI=window.KleenestPartnerROI||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Partner ROI boundary unavailable');return api.rpc(name,args)};
 R.campaignROI=(campaignId,start,end)=>rpc('get_partner_campaign_roi',{p_campaign_id:campaignId,p_start:start,p_end:end});
 R.networkBenchmark=(networkId,start,end)=>rpc('get_partner_network_benchmark',{p_network_id:networkId,p_start:start,p_end:end});
 R.recordOutcome=(campaignId,partnerId,metrics={})=>rpc('record_enterprise_partner_campaign_outcome',{p_campaign_id:campaignId,p_partner_business_id:partnerId,p_visits:metrics.visits||0,p_check_ins:metrics.checkIns||0,p_reviews:metrics.reviews||0,p_preferred_uses:metrics.preferredUses||0,p_access_redemptions:metrics.accessRedemptions||0,p_promotion_redemptions:metrics.promotionRedemptions||0,p_attributed_users:metrics.attributedUsers||0,p_points_awarded:metrics.pointsAwarded||0});
 R.rankPartners=(rows=[])=>[...rows].sort((a,b)=>Number(b.engagement_score||0)-Number(a.engagement_score||0));
 R.recommendAllocation=(rows=[])=>R.rankPartners(rows).map((r,i)=>({partner_business_id:r.partner_business_id,priority:i<3?'high':i<7?'medium':'maintain',reason:Number(r.checkin_rate||0)>20?'Strong conversion':Number(r.review_rate||0)>20?'Strong review engagement':'Needs optimization'}));
 R.summary=rows=>({partners:rows.length,winners:R.rankPartners(rows).slice(0,3),averageCheckinRate:rows.length?rows.reduce((s,r)=>s+Number(r.checkin_rate||0),0)/rows.length:0});
})();
