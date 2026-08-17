/* Canonical business feature registry. UI modules should consume this instead of hard-coding feature/tier rules. */
export const BUSINESS_FEATURES=Object.freeze([
 {key:'overview',label:'Overview',dataset:'business_overview',advanced:false,mode:'analytics'},
 {key:'locations',label:'Locations',dataset:'locations',advanced:false,mode:'crud'},
 {key:'reviews',label:'Reviews',dataset:'reviews',advanced:false,mode:'engagement'},
 {key:'analytics',label:'Basic Analytics',dataset:'analytics_events',advanced:false,mode:'analytics'},
 {key:'promotions',label:'Promotions',dataset:'promotions',advanced:true,mode:'crud',minTier:'growth'},
 {key:'events',label:'Events',dataset:'business_events',advanced:true,mode:'crud',minTier:'growth'},
 {key:'campaigns',label:'Campaigns',dataset:'business_campaigns',advanced:true,mode:'crud',minTier:'growth'},
 {key:'contests',label:'Contests',dataset:'contests',advanced:true,mode:'crud',minTier:'growth'},
 {key:'qr',label:'QR Studio',dataset:'qr_codes',advanced:true,mode:'crud',minTier:'growth'},
 {key:'partnerships',label:'Partner Programs',dataset:'partner_programs',advanced:true,mode:'crud',minTier:'enterprise'},
 {key:'certifications',label:'Certifications',dataset:'business_certifications',advanced:false,mode:'status'},
 {key:'leaderboards',label:'Metric Leaderboards',dataset:'business_metric_leaderboards',advanced:true,mode:'analytics',minTier:'growth'},
 {key:'preferred_usage',label:'Preferred Use Analytics',dataset:'preferred_business_analytics',advanced:true,mode:'analytics',minTier:'growth'},
 {key:'engagement_attribution',label:'Engagement Attribution',dataset:'business_engagement_attributions',advanced:true,mode:'analytics',minTier:'growth'},
 {key:'partner_outcomes',label:'Partner Campaign Outcomes',dataset:'enterprise_partner_campaign_outcomes',advanced:true,mode:'analytics',minTier:'enterprise'},
]);

const ADVANCED_ROLES=Object.freeze(['owner','admin','manager']);
const TIER_RANK=Object.freeze({standard:1,growth:2,enterprise:3});

export function getBusinessFeature(key){return BUSINESS_FEATURES.find(f=>f.key===key)||null;}
export function businessFeatureAccess(feature,{tier='standard',role='',isAdmin=false}={}){
 const f=typeof feature==='string'?getBusinessFeature(feature):feature;
 if(!f)return {exists:false,allowed:false,advanced:false,reason:'unknown_feature'};
 const normalizedRole=String(role).toLowerCase();
 const normalizedTier=String(tier).toLowerCase();
 if(isAdmin)return {exists:true,allowed:true,advanced:f.advanced,reason:'admin'};
 if(!f.advanced)return {exists:true,allowed:true,advanced:false,reason:'included'};
 const roleEligible=ADVANCED_ROLES.includes(normalizedRole);
 const required=f.minTier||'growth';
 const tierEligible=(TIER_RANK[normalizedTier]||0)>=(TIER_RANK[required]||99);
 return {exists:true,allowed:roleEligible&&tierEligible,advanced:true,reason:roleEligible?(tierEligible?'tier_enabled':'upgrade_required'):'role_restricted',requiredTier:required};
}

export function businessFeatureGroups(){return BUSINESS_FEATURES.reduce((out,f)=>{const group=f.advanced?'advanced':'included';(out[group] ||= []).push(f);return out;},{});}
