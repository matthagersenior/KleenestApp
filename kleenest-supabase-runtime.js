/* Kleenest Supabase runtime bridge.
 * The legacy UI remains intact. This layer progressively moves live data behind
 * the existing functions instead of replacing the application wholesale.
 */
(function () {
  'use strict';

  function ready() {
    return !!(window.KleenestSupabase && window.KleenestSupabase.client);
  }

  window.KleenestRuntime = window.KleenestRuntime || {};
  window.KleenestRuntime.supabaseReady = ready;
  window.KleenestRuntime.getSession = async function () { if (!ready()) return null; return window.KleenestSupabase.session(); };
  window.KleenestRuntime.signIn = function (email, password) { if (!ready()) return Promise.reject(new Error('Supabase is not ready.')); return window.KleenestSupabase.signIn(email, password); };
  window.KleenestRuntime.signUp = function (email, password, metadata) { if (!ready()) return Promise.reject(new Error('Supabase is not ready.')); return window.KleenestSupabase.signUp(email, password, metadata || {}); };
  window.KleenestRuntime.signOut = function () { if (!ready()) return Promise.reject(new Error('Supabase is not ready.')); return window.KleenestSupabase.signOut(); };

  function requireAuth() {
    return window.KleenestRuntime.getSession().then(function (s) {
      if (!s) throw new Error('Please sign in to continue.');
      return s;
    });
  }

  /* These actions intentionally call the protected Supabase RPCs. The browser
     never receives or writes privileged credentials directly. */
  window.KleenestRuntime.verifyCheckin = function (qrCode, lat, lng) {
    return requireAuth().then(function () {
      return window.KleenestSupabase.verifyCheckin(qrCode, lat, lng);
    });
  };

  window.KleenestRuntime.replyToReview = function (reviewId, reply) {
    return requireAuth().then(function () {
      return window.KleenestSupabase.replyToReview(reviewId, reply);
    });
  };

  window.KleenestRuntime.redeemPromotion = function (promotionId, locationId) {
    return requireAuth().then(function () {
      return window.KleenestSupabase.redeemPromotion(promotionId, locationId || null);
    });
  };

  window.KleenestRuntime.markNotificationRead = function (notificationId) {
    return requireAuth().then(function () {
      return window.KleenestSupabase.markNotificationRead(notificationId);
    });
  };

  function mapAuthUser(user, profile) {
    if (!user) return null;
    return {
      id: user.id, email: user.email || '',
      displayName: profile?.display_name || profile?.username || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Kleenest user',
      username: profile?.username || user.user_metadata?.username || '',
      avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || '',
      role: profile?.role || 'user', subscriptionTier: profile?.subscription_tier || 'free',
      points: Number(profile?.points || 0), level: Number(profile?.level || 1), streak: Number(profile?.streak || 0),
      totalCheckIns: Number(profile?.total_check_ins || 0), totalReviews: Number(profile?.total_reviews || 0),
      isBusinessUser: !!profile?.is_business_user, isAdmin: !!profile?.is_admin, source: 'supabase'
    };
  }

  async function syncSession() {
    if (!ready()) return null;
    try {
      const session = await window.KleenestSupabase.session();
      const profile = session ? await window.KleenestSupabase.profile() : null;
      const user = mapAuthUser(session?.user, profile);
      if (typeof state !== 'undefined') { state.session = user; if (typeof render === 'function') render(); }
      window.KleenestRuntime.session = session;
      window.KleenestRuntime.user = user;
      window.dispatchEvent(new CustomEvent('kleenest:auth-changed', { detail: { session, user } }));
      return session;
    } catch (err) { console.warn('Kleenest Supabase session sync failed:', err); return null; }
  }
  window.KleenestRuntime.syncSession = syncSession;

  function installAuthListener() {
    if (!ready() || window.KleenestRuntime.__authListenerInstalled) return false;
    window.KleenestRuntime.__authListenerInstalled = true;
    window.KleenestSupabase.client().auth.onAuthStateChange(function (_event, session) {
      window.KleenestRuntime.session = session;
      setTimeout(syncSession, 0);
    });
    return true;
  }

  function mapLocation(row) {
    return { id:String(row.id), name:row.name||'Kleenest location', businessId:row.business_id||null,
      address:row.address||'', city:row.city||'', state:row.state||'', lat:Number(row.latitude), lng:Number(row.longitude),
      distanceMeters:Number(row.distance_meters||0), distanceMiles:Number(row.distance_meters||0)/1609.344,
      rating:Number(row.rating||0), reviews:Number(row.review_count||0), cleanlinessPct:Number(row.cleanliness_pct||0),
      accessible:!!row.accessible, changing:!!row.changing_table, verified:true, source:'supabase' };
  }

  function mergeSupabaseLocations(rows) {
    if (!Array.isArray(rows) || typeof state === 'undefined' || !Array.isArray(state.restrooms)) return;
    const incoming=rows.map(mapLocation).filter(r=>Number.isFinite(r.lat)&&Number.isFinite(r.lng)); if(!incoming.length)return;
    const existing=new Map(state.restrooms.map(r=>[String(r.id),r]));
    incoming.forEach(r=>{const prior=existing.get(r.id);if(prior)Object.assign(prior,r);else existing.set(r.id,r);});
    state.restrooms=Array.from(existing.values()); if(typeof render==='function')render();
  }

  function installMapBridge() {
    if(!ready()||typeof loadRestroomsForLocation!=='function')return false;
    if(loadRestroomsForLocation.__supabaseWrapped)return true;
    const legacyLoad=loadRestroomsForLocation;
    async function wrappedLoad(latitude,longitude,accuracy){
      const legacyPromise=Promise.resolve().then(()=>legacyLoad(latitude,longitude,accuracy));
      const supabasePromise=window.KleenestSupabase.nearbyLocations(latitude,longitude,15000,100).catch(err=>{console.warn('Supabase nearby locations unavailable; keeping existing map data.',err);return[];});
      const [legacyResult,supabaseRows]=await Promise.all([legacyPromise,supabasePromise]); mergeSupabaseLocations(supabaseRows); return legacyResult;
    }
    wrappedLoad.__supabaseWrapped=true; window.loadRestroomsForLocation=wrappedLoad; return true;
  }

  let attempts=0; const timer=setInterval(()=>{ attempts+=1; if(!ready())return; installAuthListener();
    if(!window.KleenestRuntime.__initialSessionSync){window.KleenestRuntime.__initialSessionSync=true;syncSession();}
    if(installMapBridge()||attempts>=100)clearInterval(timer);
  },25);
  window.dispatchEvent(new CustomEvent('kleenest:supabase-ready',{detail:{ready:ready()}}));
})();
