/* Enterprise growth loop: benchmark -> allocate -> activate -> measure -> optimize. */
(function(){'use strict';
 const G=window.KleenestEnterpriseGrowthLoop=window.KleenestEnterpriseGrowthLoop||{};
 const A=()=>window.KleenestPartnerAllocation;
 const I=()=>window.KleenestEnterprisePartnerIntelligence;
 G.plan=async(networkId,partners=[])=>partners.map(p=>({partner:p,plans:I().recommendations(p),allocations:A().planFromBenchmark(p)}));
 G.activate=async(allocationIds=[])=>Promise.all(allocationIds.map(id=>A().activate(id)));
 G.measure=(before={},after={})=>{const keys=['visits','check_ins','reviews','preferred_uses','access_redemptions','promotion_redemptions','points_awarded'];const out={};for(const k of keys){const b=Number(before[k]||0),a=Number(after[k]||0);out[k]={before:b,after:a,delta:a-b,growthPct:b?((a-b)/b)*100:null};}return out};
 G.optimize=(measurement={})=>Object.entries(measurement).map(([metric,v])=>v.delta>0?{metric,action:'scale'}:{metric,action:'optimize'});
 G.render=(root,data={})=>{if(!root)return;const rows=data.results||[];root.innerHTML=`<section class="kleenest-enterprise-growth-loop"><header><h2>Enterprise Growth Loop</h2><p>Benchmark partners, allocate resources, measure outcomes, and continuously optimize.</p></header><div class="growth-loop-grid">${rows.map(r=>`<article><h3>${r.partner?.partner_name||r.partner?.name||'Partner'}</h3><p>${(r.allocations||[]).length} recommended allocations</p><p>${(r.plans||[]).length} growth actions</p></article>`).join('')}</div></section>`};
})();
