/* Fleet/Enterprise partner network operations: invite, activate, pause/remove, and metric ingestion. */
(function(){'use strict';
 const E=window.KleenestEnterprisePartnerOperations=window.KleenestEnterprisePartnerOperations||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Enterprise partner operations boundary unavailable');return api.rpc(name,args)};
 E.invite=(networkId,partnerBusinessId)=>rpc('invite_enterprise_partner',{p_network_id:networkId,p_partner_business_id:partnerBusinessId});
 E.setStatus=(membershipId,status)=>rpc('set_enterprise_partner_status',{p_membership_id:membershipId,p_status:status});
 E.activate=id=>E.setStatus(id,'active'); E.pause=id=>E.setStatus(id,'paused'); E.remove=id=>E.setStatus(id,'removed');
 E.recordMetrics=(networkId,date,metrics={})=>rpc('record_enterprise_partner_metric',{p_network_id:networkId,p_metric_date:date,p_visits:metrics.visits||0,p_check_ins:metrics.check_ins||0,p_reviews:metrics.reviews||0,p_preferred_uses:metrics.preferred_uses||0,p_access_redemptions:metrics.access_redemptions||0,p_promotion_redemptions:metrics.promotion_redemptions||0});
 E.plan=(metrics={})=>{const actions=[];if(Number(metrics.access_redemptions)>0)actions.push('Expand single-use partner access');if(Number(metrics.promotion_redemptions)>0)actions.push('Replicate successful promotions across partners');if(Number(metrics.preferred_uses)>0)actions.push('Expand Preferred coverage');if(Number(metrics.check_ins)>Number(metrics.reviews)*3)actions.push('Run a review-quality challenge');return actions};
})();
