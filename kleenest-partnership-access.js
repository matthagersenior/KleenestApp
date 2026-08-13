/* Partnership/access parity: premium travelers receive matched benefits; everyone may buy free single-use offers; Growth+ may sell. */
(function(){'use strict';
 const P=window.KleenestPartnershipAccess=window.KleenestPartnershipAccess||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Partnership boundary unavailable');return api.rpc(name,args)};
 P.consumerTier=user=>{const s=user?.subscriptionLevel; if(s==='Enterprise')return'enterprise';if(s==='Fleet')return'fleet';if(s==='Premium'||user?.familyAddon)return'premium';return null};
 P.businessTier=b=>{const t=String(b?.businessTier||b?.business_tier||'standard').toLowerCase();return['enterprise','growth'].includes(t)?t:'standard'};
 P.eligibility=(user,business)=>!!P.consumerTier(user)&&!!business&&P.businessTier(business)!=='standard';
 P.getOffers=()=>window.KleenestSingleUseAccess.getOffers();
 P.purchase=id=>window.KleenestSingleUseAccess.purchase(id);
 P.redeem=id=>window.KleenestSingleUseAccess.redeem(id);
 P.createOffer=(programId,name,description,priceCents=0,quantity=1,expiresAt=null)=>window.KleenestSingleUseAccess.createOffer(programId,name,description,priceCents,quantity,expiresAt);
 P.rewardRedemption=async(purchaseId,metadata={})=>window.KleenestActionRewards?.businessEngagement('single_use_access_redemption',purchaseId,metadata);
 P.render=(root,offers=[])=>{if(!root)return;root.innerHTML=`<section class="kleenest-partnership-access"><header><h2>Partner Access</h2><p>Matched Premium, Fleet and Enterprise benefits plus free single-use access offers.</p></header><div class="kleenest-access-grid">${offers.map(o=>`<article><h3>${o.name||'Partner Access'}</h3><p>${o.description||'Single-use partnership access'}</p><strong>${Number(o.price_cents||0)===0?'Free':'$'+(Number(o.price_cents||0)/100).toFixed(2)}</strong><button type="button" data-partner-purchase="${o.id}">Purchase</button></article>`).join('')}</div></section>`};
})();
