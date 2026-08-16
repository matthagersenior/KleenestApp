/* Canonical Admin operation bridge. UI never performs privileged direct-table mutations. */
(function(g){'use strict';if(g.KleenestAdminOpsV1)return;var client=()=>g.KleenestRuntime?.supabase||g.KleenestSupabase||g.supabase||null;
var adminRpc={profiles:{update:'admin_set_account_capabilities'},businesses:{updateTier:'admin_set_business_tier',verify:'admin_set_business_verification'}};
async function invoke(name,args){var s=client();if(!s?.rpc)throw new Error('Admin data service unavailable');var r=await s.rpc(name,args||{});if(r.error)throw r.error;return r.data}
async function setAccountCapabilities(args){return invoke(adminRpc.profiles.update,{p_target_user_id:args.userId,p_role:args.role??null,p_subscription_tier:args.subscriptionTier??null,p_is_business_user:args.isBusinessUser??null,p_is_admin:args.isAdmin??null,p_is_demo_test:args.isDemoTest??null,p_reason:args.reason||'Admin account management'})}
async function setBusinessTier(businessId,tier){return invoke(adminRpc.businesses.updateTier,{p_business_id:businessId,p_tier:tier})}
async function setBusinessVerification(businessId,status){return invoke(adminRpc.businesses.verify,{p_business_id:businessId,p_status:status})}
g.KleenestAdminOpsV1={invoke,setAccountCapabilities,setBusinessTier,setBusinessVerification,adminRpc};})(window);