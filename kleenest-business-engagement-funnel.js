/* Business-facing funnel analytics built from attributable consumer activity. */
(function(){'use strict';
 const F=window.KleenestBusinessEngagementFunnel=window.KleenestBusinessEngagementFunnel||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Business funnel boundary unavailable');return api.rpc(name,args)};
 F.get=(businessId,start,end)=>rpc('get_business_engagement_funnel',{p_business_id:businessId,p_start:start,p_end:end});
 F.normalize=rows=>{const out={};for(const r of rows||[])out[r.activity_type]={events:Number(r.events||0),uniqueUsers:Number(r.unique_users||0),source:r.source};return out};
 F.conversion=(rows=[])=>(F.normalize(rows));
 F.opportunities=rows=>{const n=F.normalize(rows);const visits=n.visit?.events||0,checks=n.check_in?.events||0,reviews=n.review?.events||0,conversions=(n.promotion?.events||0)+(n.preferred_use?.events||0)+(n.promotion_redeemed?.events||0)+(n.single_use_access_redemption?.events||0);const r=[];if(visits&&checks/visits<.15)r.push('Increase check-in conversion with a location challenge');if(checks&&reviews/checks<.2)r.push('Launch a review-quality reward');if(visits&&!conversions)r.push('Offer a promotion, Preferred benefit, or single-use access');if(conversions)r.push('Benchmark and scale the highest-converting campaign');return r};
})();
