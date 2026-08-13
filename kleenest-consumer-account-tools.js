/* Consumer account management, support, and Premium gating. */
(function(){'use strict';const A=window.KleenestAccountTools=window.KleenestAccountTools||{};
 A.PREMIUM_PRICE_USD=5;A.PREMIUM_PRODUCT_ID='kleenest_premium_lifetime';
 A.isPremium=()=>window.KleenestPremium?.state?.(window.KleenestAccountState?.currentUser)?.status==='owned'||!!window.KleenestPremium?.isPremium?.(window.KleenestAccountState?.currentUser);
 A.requirePremium=(feature)=>{if(A.isPremium())return true;window.dispatchEvent(new CustomEvent('kleenest:premium-upgrade-required',{detail:{feature,price:A.PREMIUM_PRICE_USD,productId:A.PREMIUM_PRODUCT_ID,oneTime:true,adsSupported:true}}));window.KleenestUI?.openPremiumUpgrade?.(feature);return false;};
 A.changePassword=async(password)=>{if(!window.KleenestAuth?.changePassword)throw new Error('Password change unavailable');return window.KleenestAuth.changePassword(password);};
 A.changeProfilePicture=async(url)=>{if(!window.KleenestAuth?.updateProfile)throw new Error('Profile update unavailable');return window.KleenestAuth.updateProfile({avatar_url:url});};
 A.submitBug=async(payload)=>window.KleenestSupport?.submit?.({type:'bug',...payload});
 A.submitSupport=async(payload)=>window.KleenestSupport?.submit?.({type:'support',...payload});
 A.submitFeedback=async(payload)=>window.KleenestSupport?.submit?.({type:'feedback',...payload});
 A.gateContest=(id)=>A.requirePremium('contest:'+id);A.gateRewardPromotion=(id)=>A.requirePremium('reward-promotion:'+id);
})();
