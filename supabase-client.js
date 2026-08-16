/* Kleenest Supabase frontend bridge. */
(function () {
  const SUPABASE_URL = 'https://ssgesjzdvdsqacdtasje.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_f1rbczgvWKSQy2g9mTDQZg_K9Wv19bL';
  function client(){if(!window.supabase?.createClient)throw new Error('Supabase JS v2 is not loaded.');if(!window.kleenestSupabase)window.kleenestSupabase=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return window.kleenestSupabase}
  async function session(){const {data,error}=await client().auth.getSession();if(error)throw error;return data.session}
  async function signIn(email,password){const {data,error}=await client().auth.signInWithPassword({email,password});if(error)throw error;return data}
  async function signUp(email,password,metadata={}){const {data,error}=await client().auth.signUp({email,password,options:{data:metadata}});if(error)throw error;return data}
  async function signOut(){const {error}=await client().auth.signOut();if(error)throw error}
  async function profile(){const s=await session();if(!s)return null;const {data,error}=await client().from('profiles').select('*').eq('id',s.user.id).maybeSingle();if(error)throw error;return data}
  async function businessMemberships(){const s=await session();if(!s)return[];const c=client();let primary=await c.from('business_members').select('*, businesses(*)').eq('user_id',s.user.id);if(!primary.error&&primary.data?.length)return primary.data;let legacy=await c.from('app_business_memberships').select('*, businesses(*)').eq('user_id',s.user.id);if(!legacy.error&&legacy.data?.length)return legacy.data;return[]}
  async function nearbyLocations(lat,lng,radiusMeters=15000,limit=100){const {data,error}=await client().rpc('nearby_locations',{lat:Number(lat),lng:Number(lng),radius_meters:Math.min(Math.max(Number(radiusMeters),1),50000),limit_count:Math.min(Math.max(Number(limit),1),200)});if(error)throw error;return data||[]}
  async function searchLocations(searchText,maxResults=50){const {data,error}=await client().rpc('search_locations',{search_text:String(searchText||'').trim(),max_results:Math.min(Math.max(Number(maxResults),1),100)});if(error)throw error;return data||[]}
  async function verifyCheckin(qrCode,lat,lng){const {data,error}=await client().rpc('verify_checkin',{p_qr_code:qrCode,p_lat:Number(lat),p_lng:Number(lng)});if(error)throw error;return data}
  async function replyToReview(reviewId,reply){const {data,error}=await client().rpc('reply_to_review',{p_review_id:reviewId,p_reply:String(reply||'').trim()});if(error)throw error;return data}
  async function redeemPromotion(promotionId,locationId=null){const {data,error}=await client().rpc('redeem_promotion',{p_promotion_id:promotionId,p_location_id:locationId});if(error)throw error;return data}
  async function markNotificationRead(notificationId){const {data,error}=await client().rpc('mark_notification_read',{p_notification_id:notificationId});if(error)throw error;return data}
  async function dashboardSummary(businessId,start,end){const {data,error}=await client().rpc('business_dashboard_summary',{p_business_id:businessId,p_start:start||new Date(Date.now()-30*86400000).toISOString(),p_end:end||new Date().toISOString()});if(error)throw error;return data||[]}
  window.KleenestSupabase={url:SUPABASE_URL,client,session,signIn,signUp,signOut,profile,businessMemberships,nearbyLocations,searchLocations,verifyCheckin,replyToReview,redeemPromotion,markNotificationRead,dashboardSummary};
})();