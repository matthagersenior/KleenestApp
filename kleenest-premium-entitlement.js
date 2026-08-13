/* Permanent Premium upgrade: one-time purchase, no recurring renewal. */
(function(){'use strict';
 const E=window.KleenestPremium=window.KleenestPremium||{};
 E.version='1.0';
 E.PRODUCT_ID='kleenest_premium_lifetime';
 E.MODE='one_time';
 E.price={web:null,ios:null,android:null};
 E.isPremium=user=>!!(user&&(user.premiumEntitlement==='active'||user.premiumOwnership==='lifetime'||user.subscriptionLevel==='Premium'||user.subscriptionLevel==='Fleet'||user.subscriptionLevel==='Enterprise'||user.subscriptionLevel==='Business'||user.isAdmin));
 E.state=user=>{if(!user)return 'signed_out';if(E.isPremium(user))return 'owned';return 'free_ad_supported';};
 E.purchase=async user=>{if(!user)throw new Error('Authentication required');if(E.isPremium(user))return {status:'owned',productId:E.PRODUCT_ID};user.premiumEntitlement='active';user.premiumOwnership='lifetime';user.premiumProductId=E.PRODUCT_ID;user.premiumPurchasedAt=new Date().toISOString();user.billingModel='one_time';user.subscriptionRenewalAt=null;user.subscriptionCancelAt=null;user.subscriptionStatus=null;user.adsEnabled=false;user.subscriptionLevel='Premium';window.KleenestPlatform?.storage?.set('premium-entitlement',{productId:E.PRODUCT_ID,ownership:'lifetime',purchasedAt:user.premiumPurchasedAt});window.dispatchEvent(new CustomEvent('kleenest:premium-purchased',{detail:{productId:E.PRODUCT_ID,ownership:'lifetime'}}));return {status:'purchased',productId:E.PRODUCT_ID,ownership:'lifetime'};};
 E.restore=async user=>{if(!user)return {status:'signed_out'};const saved=window.KleenestPlatform?.storage?.get('premium-entitlement');if(saved&&saved.productId===E.PRODUCT_ID){user.premiumEntitlement='active';user.premiumOwnership='lifetime';user.premiumProductId=E.PRODUCT_ID;user.billingModel='one_time';user.subscriptionRenewalAt=null;user.subscriptionCancelAt=null;user.subscriptionStatus=null;user.adsEnabled=false;user.subscriptionLevel='Premium';return {status:'restored',productId:E.PRODUCT_ID,ownership:'lifetime'};}return {status:E.isPremium(user)?'owned':'free_ad_supported'};};
 E.adsEnabled=user=>!E.isPremium(user);
 E.assertNoRenewal=user=>{if(!user)return true;if(user.premiumOwnership==='lifetime'&&(user.subscriptionRenewalAt||user.subscriptionCancelAt||user.subscriptionStatus))throw new Error('Lifetime Premium cannot have recurring subscription state');return true;};
})();
