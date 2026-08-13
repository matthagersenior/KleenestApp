/* Fleet/Enterprise partner intelligence: network-level analytics for partner businesses. */
(function(){'use strict';
 const E=window.KleenestEnterprisePartnerIntelligence=window.KleenestEnterprisePartnerIntelligence||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Enterprise partner intelligence boundary unavailable');return api.rpc(name,args)};
 E.createNetwork=name=>rpc('create_enterprise_partner_network',{p_name:name});
 E.getNetwork=(networkId,start,end)=>rpc('get_enterprise_partner_network',{p_network_id:networkId,p_start:start,p_end:end});
 E.benchmark=(rows=[])=>{const a=rows.map(Number);return {total:a.reduce((x,y)=>x+y,0),average:a.length?a.reduce((x,y)=>x+y,0)/a.length:0,max:a.length?Math.max(...a):0,min:a.length?Math.min(...a):0}};
 E.partnerScore=(m={})=>Math.round((Number(m.visits||0)*.15)+(Number(m.check_ins||0)*.25)+(Number(m.reviews||0)*.15)+(Number(m.preferred_uses||0)*.2)+(Number(m.access_redemptions||0)*.15)+(Number(m.promotion_redemptions||0)*.1));
 E.recommendations=(m={})=>{const r=[];if(Number(m.access_redemptions||0)>0)r.push('Expand single-use partner access inventory');if(Number(m.preferred_uses||0)>0)r.push('Increase Preferred availability at high-demand partner locations');if(Number(m.promotion_redemptions||0)>0)r.push('Scale promotions across the strongest partner locations');if(Number(m.check_ins||0)>Number(m.reviews||0)*3)r.push('Activate a review-quality challenge');if(!r.length)r.push('Launch a partner engagement program to establish a measurable baseline');return r};
})();
