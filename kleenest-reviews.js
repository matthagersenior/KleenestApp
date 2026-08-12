/* Kleenest review data layer. */
(function () {
  'use strict';
  window.KleenestReviews = window.KleenestReviews || {};
  function supabase() { if (!window.KleenestSupabase?.client) throw new Error('Supabase is not ready.'); return window.KleenestSupabase.client(); }
  async function requireSession() { const s=await window.KleenestSupabase.session(); if(!s) throw new Error('Please sign in to continue.'); return s; }

  window.KleenestReviews.create = async function (locationId, checkInId, stars, cleanlinessPct, comment) {
    await requireSession();
    const rating=Number(stars); const clean=cleanlinessPct==null||cleanlinessPct===''?null:Number(cleanlinessPct);
    if(!locationId) throw new Error('A location is required.');
    if(!Number.isInteger(rating)||rating<1||rating>5) throw new Error('Stars must be between 1 and 5.');
    if(clean!==null&&(!Number.isFinite(clean)||clean<0||clean>100)) throw new Error('Cleanliness must be between 0 and 100.');
    const {data,error}=await supabase().rpc('create_review',{p_location_id:locationId,p_check_in_id:checkInId||null,p_stars:rating,p_cleanliness_pct:clean,p_comment:String(comment||'').trim()||null});
    if(error) throw error;
    window.dispatchEvent(new CustomEvent('kleenest:review-created',{detail:data}));
    return data;
  };

  window.KleenestReviews.forLocation = async function (locationId, limit=50) {
    if(!locationId) return [];
    const {data,error}=await supabase().from('reviews').select('id,location_id,user_id,check_in_id,stars,cleanliness_pct,comment,status,business_reply,business_replied_at,created_at,updated_at').eq('location_id',locationId).order('created_at',{ascending:false}).limit(Math.min(Math.max(Number(limit),1),100));
    if(error) throw error; return data||[];
  };
})();
