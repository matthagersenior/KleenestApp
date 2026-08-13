/* Immutable partner matching parity: prevents tier/discount state from leaking between venues. */
(function(){'use strict';
 const M=window.KleenestPartnerMatching=window.KleenestPartnerMatching||{};
 const matrix={premium:{standard:[5,'Preferred check-in'],growth:[10,'Priority access'],enterprise:[15,'VIP partner access']},fleet:{standard:[8,'Fleet preferred'],growth:[12,'Fleet priority'],enterprise:[18,'Fleet VIP']},enterprise:{standard:[10,'Enterprise preferred'],growth:[15,'Enterprise priority'],enterprise:[20,'Enterprise ↔ Enterprise VIP']}};
 M.consumerTier=u=>{if(!u||u.isBusinessUser)return null;if(u.subscriptionLevel==='Enterprise')return'enterprise';if(u.subscriptionLevel==='Fleet')return'fleet';if(u.subscriptionLevel==='Premium'||u.familyAddon)return'premium';return null};
 M.businessTier=b=>{const t=String(b?.businessTier||b?.business_tier||'standard').toLowerCase();return t==='enterprise'?'enterprise':t==='growth'?'growth':'standard'};
 M.match=(user,business)=>{const c=M.consumerTier(user);if(!c)return null;const b=M.businessTier(business);const [discountPct,access]=matrix[c][b];const p=business?.partnerProgram||{};return {consumerTier:c,businessTier:b,discountPct:Math.min(30,discountPct+Number(p.matchDiscountBonus||0)),access,preferredAccess:p.preferredAccess!==false,customPerk:p.customPerk||'',coops:(p.coopAgreements||[]).map(x=>x.label||x.partnerName).filter(Boolean),programActive:p.enabled!==false};};
 M.rank=(user,businesses=[])=>businesses.map(b=>({...M.match(user,b),businessId:b.id,name:b.name})).filter(x=>x).sort((a,b)=>b.discountPct-a.discountPct);
})();
