/* Single-use partnership access: everyone may purchase; Growth+ businesses may sell. */
(function(){'use strict';
 const A=window.KleenestSingleUseAccess=window.KleenestSingleUseAccess||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Single-use access boundary unavailable');return api.rpc(name,args)};
 A.getOffers=()=>rpc('get_single_use_access_offers');
 A.purchase=(offerId)=>rpc('purchase_single_use_access',{p_offer_id:offerId});
 A.redeem=(purchaseId)=>rpc('redeem_single_use_access',{p_purchase_id:purchaseId});
 A.createOffer=(programId,name,description,priceCents,quantity,expiresAt=null)=>rpc('business_create_single_use_access_offer',{p_partner_program_id:programId,p_name:name,p_description:description,p_price_cents:priceCents,p_quantity:quantity,p_expires_at:expiresAt});
 A.canSell=async()=>{const d=await window.KleenestBusinessSurface.getDashboard();const b=d?.business||d;return ['growth','enterprise'].includes(String(b?.business_tier||b?.tier||'').toLowerCase())};
 A.render=(root,offers=[])=>{if(!root)return;root.innerHTML=`<section class="kleenest-access"><header><h2>Single-Use Access</h2><p>Purchase individual partnership access when you need it. Business Growth and Enterprise partners can sell access.</p></header><div class="kleenest-access-grid">${(offers||[]).map(o=>`<article><h3>${String(o.name||'Access')}</h3><p>${String(o.description||'Single-use partnership benefit')}</p><strong>${Number(o.price_cents||0)===0?'Free':'$'+(Number(o.price_cents||0)/100).toFixed(2)}</strong><button type="button" data-access-purchase="${o.id}">Purchase</button></article>`).join('')}</div></section>`;};
})();
