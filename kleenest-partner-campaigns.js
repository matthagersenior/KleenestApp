/* Partner campaign orchestration: enterprise networks turn intelligence into measurable campaigns. */
(function(){'use strict';
 const C=window.KleenestPartnerCampaigns=window.KleenestPartnerCampaigns||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Partner campaign boundary unavailable');return api.rpc(name,args)};
 C.create=async(networkId,name,type,goal)=>rpc('create_enterprise_partner_campaign',{p_network_id:networkId,p_name:name,p_campaign_type:type,p_goal:goal});
 C.activate=id=>rpc('activate_enterprise_partner_campaign',{p_campaign_id:id});
 C.pause=id=>rpc('pause_enterprise_partner_campaign',{p_campaign_id:id});
 C.recordOutcome=(id,metric,value)=>rpc('record_enterprise_partner_campaign_outcome',{p_campaign_id:id,p_metric:metric,p_value:value});
 C.getPerformance=(id,start,end)=>rpc('get_enterprise_partner_campaign_performance',{p_campaign_id:id,p_start:start,p_end:end});
 C.reward=async(id,metadata={})=>window.KleenestActionRewards?.businessEngagement('partner_campaign',id,metadata);
 C.recommend=performance=>{const p=performance||{};const r=[];if(Number(p.access_redemptions||0)>Number(p.visits||0)*.05)r.push('Increase access inventory');if(Number(p.promotion_redemptions||0)>0)r.push('Scale the promotion to comparable partners');if(Number(p.check_ins||0)>Number(p.reviews||0)*3)r.push('Add a review-quality challenge');if(Number(p.preferred_uses||0)>0)r.push('Expand Preferred availability');return r};
})();
