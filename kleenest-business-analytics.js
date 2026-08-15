/* Live Business Intelligence bridge. Every dataset maps to an authoritative Supabase reporting function. */
(function(){'use strict';
const A=window.kleenestBusinessAnalytics=window.kleenestBusinessAnalytics||{};
const c=()=>window.KleenestSupabase?.getClient?.()||window.KleenestSupabase?.client?.();
async function rpc(n,p={}){const x=c();if(!x)throw Error('Supabase client unavailable');const r=await x.rpc(n,p);if(r.error)throw r.error;return r.data}
function range(s,e){return{p_start:s||new Date(Date.now()-30*864e5).toISOString(),p_end:e||new Date().toISOString()}}
async function businesses(){const m=await window.KleenestSupabase.businessMemberships();return [...new Map((m||[]).filter(x=>['owner','admin','manager','analyst'].includes(String(x.role||'').toLowerCase())).map(x=>[x.business_id,x])).values()].map(x=>x.business_id).filter(Boolean)}
const MAP={overview:'partner_preferred_analytics',locations:'partner_preferred_analytics',engagement:'partner_preferred_analytics',qr:'business_qr_analytics',visitors:'partner_preferred_analytics',reviews:'business_review_analytics',photos:'business_media_analytics',promotions:'business_promotion_analytics',campaigns:'business_campaign_analytics',partnerships:'business_partner_analytics',rewards:'business_rewards_analytics',events:'business_event_analytics',occupancy:'business_occupancy_analytics',roi:'business_roi_analytics',growth:'business_growth_analytics',benchmarks:'business_benchmark_analytics',contests:'business_event_analytics'};
const DETAIL={locations:'business_location_detail',reviews:'business_review_detail',photos:'business_media_detail',promotions:'business_promotion_detail',campaigns:'business_campaign_detail',events:'business_event_detail',partnerships:'business_partner_detail',qr:'business_qr_detail',contests:'business_list_contests'};
const FIELDS={
overview:['views','check_ins','reviews','qr_scans','favorites','promotion_views'],
locations:['locations_count','check_ins','unique_users','reviews'],
engagement:['total_uses','unique_users','total_activations','active_activations'],
visitors:['unique_users','check_ins','reviews'],
qr:['qr_scans','check_ins','locations'],
reviews:['reviews','average_rating','average_cleanliness_pct','published_reviews','business_replies','locations_with_reviews'],
photos:['photos','vr_media','total_bytes','avg_bytes','locations_with_media','period_uploads'],
promotions:['promotions','active_promotions','promotion_views','redemptions','unique_redeemers','conversion_rate_pct'],
campaigns:['campaigns','active_campaigns','outcome_visits','outcome_check_ins','outcome_reviews','attributed_users','points_awarded'],
partnerships:['partner_programs','enabled_programs','partner_agreements','active_agreements','preferred_uses','partner_users'],
rewards:['check_ins','points_awarded','reward_events','reward_points'],
events:['events','rsvps','event_views','event_rsvps_tracked'],
contests:['contests'],
occupancy:['visits','check_ins','unique_visitors','peak_hour'],
roi:['revenue','cost_cents','attributed_users','roi','roi_status'],
growth:['check_ins','unique_users','reviews','new_users','locations'],
benchmarks:['business_check_ins','peer_businesses','peer_average_check_ins','percentile']};
const LABELS={views:'Views',locations_count:'Locations',total_activations:'Preferred Activations',active_activations:'Active Activations',total_uses:'Program Uses',unique_users:'Unique Users',check_ins:'Check-ins',reviews:'Reviews',qr_scans:'QR Scans',locations:'Locations',favorites:'Favorites',promotion_views:'Promotion Views',average_rating:'Average Rating',average_cleanliness_pct:'Avg Cleanliness %',published_reviews:'Published Reviews',business_replies:'Business Replies',locations_with_reviews:'Locations With Reviews',photos:'Photos',vr_media:'360° / VR Media',total_bytes:'Media Bytes',avg_bytes:'Avg Media Bytes',locations_with_media:'Locations With Media',period_uploads:'Uploads',promotions:'Promotions',active_promotions:'Active Promotions',redemptions:'Redemptions',unique_redeemers:'Unique Redeemers',conversion_rate_pct:'Conversion %',campaigns:'Campaigns',active_campaigns:'Active Campaigns',outcome_visits:'Campaign Visits',outcome_check_ins:'Campaign Check-ins',outcome_reviews:'Campaign Reviews',attributed_users:'Attributed Users',points_awarded:'Points Awarded',partner_programs:'Partner Programs',enabled_programs:'Enabled Programs',partner_agreements:'Partner Agreements',active_agreements:'Active Agreements',preferred_uses:'Preferred Uses',partner_users:'Partner Users',reward_events:'Reward Events',reward_points:'Reward Points',events:'Events',rsvps:'RSVPs',event_views:'Event Views',event_rsvps_tracked:'Tracked RSVPs',contests:'Contests',visits:'Visits',unique_visitors:'Unique Visitors',peak_hour:'Peak Hour',revenue:'Revenue',cost_cents:'Tracked Cost (¢)',roi:'ROI',roi_status:'ROI Status',new_users:'New Users',business_check_ins:'Your Check-ins',peer_businesses:'Peer Businesses',peer_average_check_ins:'Peer Avg Check-ins',percentile:'Relative Check-in Index',total_events:'Events'};
async function dataset(businessId,key,start,end){
 if(key==='contests') return {rows:await rpc('business_list_contests',{p_business_id:businessId})};
 if(key==='overview'){
  const p=range(start,end),s=await rpc('business_dashboard_secure_summary',{p_business_id:businessId,...p});
  const summary=s?.summary||{};
  return {views:Number(summary.location_view||0)+Number(summary.location_impression||0),check_ins:Number(s?.check_ins||summary.check_in||0),reviews:Number(s?.reviews||summary.review_created||0),qr_scans:Number(summary.qr_scan||0),favorites:Number(summary.favorite_added||0),promotion_views:Number(summary.promotion_view||0)};
 }
 const fn=MAP[key]||MAP.overview,p=range(start,end);return fn==='business_qr_analytics'?rpc(fn,{p_business_id:businessId}):rpc(fn,{p_business_id:businessId,...p});
}
async function details(businessId,key,start,end){
 const fn=DETAIL[key];if(!fn)throw Error(`No detail provider for ${key}`);const p=range(start,end);
 if(key==='contests') return {rows:await rpc(fn,{p_business_id:businessId})};
 return {rows:await rpc(fn,{p_business_id:businessId,...p})};
}
async function current(key,start,end){const ids=await businesses();const out=[];for(const id of ids){try{out.push({business_id:id,dataset:await dataset(id,key,start,end)})}catch(e){out.push({business_id:id,error:e.message})}}return out}
async function get(businessId,key='overview',start,end){return dataset(businessId,key,start,end)}
function summarize(rows){const a={};for(const x of rows||[]){const r=x?.dataset||x||{};for(const k of Object.keys(r||{}))if(typeof r[k]==='number')a[k]=(a[k]||0)+r[k]}return a}
A.rpc=rpc;A.range=range;A.dataset=dataset;A.details=details;A.current=current;A.get=get;A.summarize=summarize;A.datasets=Object.keys(MAP);A.fields=FIELDS;A.labels=LABELS;})();