/* Modular business intelligence: quantify consumer/social/gamification behavior into business value. */
(function(){'use strict';
 const B=window.KleenestBusinessIntelligence=window.KleenestBusinessIntelligence||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Business intelligence boundary unavailable');return api.rpc(name,args)};
 B.getDashboard=(businessId,start,end)=>rpc('business_dashboard_secure_summary',{p_business_id:businessId,p_start:start,p_end:end});
 B.getPreferredAnalytics=(businessId,start,end)=>rpc('partner_preferred_analytics',{p_business_id:businessId,p_start:start,p_end:end});
 B.getPartnerUsage=(programId)=>rpc('business_partner_program_usage',{p_partner_program_id:programId});
 B.getPreferredLocationUsage=(locationId)=>rpc('business_preferred_location_usage',{p_location_id:locationId});
 B.getPromotionSummary=(promotionId)=>rpc('promotion_redemption_summary',{p_promotion_id:promotionId});
 B.getPromotionRewardSummary=(redemptionId)=>rpc('promotion_redemption_rewards_summary',{p_redemption_id:redemptionId});
 B.getBusinessPreferredSummary=()=>rpc('business_preferred_location_summary');
 B.getBusinessOverview=()=>rpc('get_business_dashboard');
 B.normalize=(d={})=>({
  visits:Number(d.visits??d.total_visits??0),checkIns:Number(d.check_ins??d.total_checkins??0),reviews:Number(d.reviews??d.total_reviews??0),favorites:Number(d.favorites??d.favorite_count??0),followers:Number(d.followers??0),promotions:Number(d.promotion_redemptions??d.redemptions??0),preferredUses:Number(d.preferred_uses??d.preferred_usage??0),
  engagementRate:Number(d.engagement_rate??0),repeatRate:Number(d.repeat_rate??0),averageRating:Number(d.average_rating??d.rating??0),verified:Boolean(d.verified??d.verification_status==='verified'),tier:d.tier??d.business_tier??'standard'
 });
 B.render=(root,data)=>{if(!root)return;const d=B.normalize(data);root.innerHTML=`<section class="kleenest-business-intelligence"><header><h2>Business Intelligence</h2><p>Turn discovery, check-ins, reviews, social engagement, promotions and Preferred usage into measurable growth.</p></header><div class="kleenest-business-kpis"><article><strong>${d.visits}</strong><span>Visits</span></article><article><strong>${d.checkIns}</strong><span>Check-ins</span></article><article><strong>${d.reviews}</strong><span>Reviews</span></article><article><strong>${d.favorites}</strong><span>Favorites</span></article><article><strong>${d.promotions}</strong><span>Promotion redemptions</span></article><article><strong>${d.preferredUses}</strong><span>Preferred uses</span></article></div><div class="kleenest-business-growth-grid"><article><h3>Customer retention</h3><p>${d.repeatRate}% repeat activity</p></article><article><h3>Engagement</h3><p>${d.engagementRate}% engagement rate</p></article><article><h3>Reputation</h3><p>${d.averageRating} average rating · ${d.verified?'Verified':'Verification pending'}</p></article><article><h3>Plan</h3><p>${d.tier}</p></article></div></section>`};
})();
