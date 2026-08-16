const METRICS = Object.freeze({
  social_post: { sourceType: 'social_post', label: 'Posts', defaultPoints: 10 },
  social_comment: { sourceType: 'social_comment', label: 'Helpful comments', defaultPoints: 3 },
  social_like: { sourceType: 'social_like', label: 'Reactions', defaultPoints: 2 },
  social_save: { sourceType: 'social_save', label: 'Saves', defaultPoints: 2 },
  social_follow: { sourceType: 'social_follow', label: 'Community connections', defaultPoints: 3 },
  contest_entry: { sourceType: 'contest', label: 'Contest entries', defaultPoints: 10 },
  contest_win: { sourceType: 'contest', label: 'Contest wins', defaultPoints: 100 },
  game_play: { sourceType: 'game', label: 'Games played', defaultPoints: 10 },
  challenge_progress: { sourceType: 'challenge', label: 'Challenge progress', defaultPoints: 5 },
  event_rsvp: { sourceType: 'event', label: 'Event RSVPs', defaultPoints: 5 },
  event_attend: { sourceType: 'event', label: 'Event attendance', defaultPoints: 20 },
  check_in: { sourceType: 'check_in', label: 'Check-ins', defaultPoints: 10 },
  location_visit: { sourceType: 'location_visit', label: 'Location visits', defaultPoints: 5 },
  location_favorited: { sourceType: 'favorite', label: 'Locations favorited', defaultPoints: 2 },
  location_unfavorited: { sourceType: 'favorite', label: 'Favorites updated', defaultPoints: 0 },
  review: { sourceType: 'review', label: 'Reviews', defaultPoints: 20 },
  verification: { sourceType: 'verification', label: 'Location verification', defaultPoints: 15 },
  location_verified: { sourceType: 'verification', label: 'Location verification', defaultPoints: 15 },
  route_complete: { sourceType: 'route', label: 'Routes completed', defaultPoints: 25 },
  campaign_engagement: { sourceType: 'campaign', label: 'Campaign engagement', defaultPoints: 5 },
  promotion_redemption: { sourceType: 'promotion', label: 'Promotions redeemed', defaultPoints: 5 },
  qr_scan: { sourceType: 'qr_scan', label: 'QR scans', defaultPoints: 10 }
});
export function createProgressionMetricsCore({ supabase } = {}) {
  if (!supabase) throw new Error('Progression Metrics Core requires Supabase.');
  async function record(metric, { sourceId = null, quantity = 1, points = null, metadata = {} } = {}) {
    const definition = METRICS[metric];
    if (!definition) throw new Error(`Unknown progression metric: ${metric}`);
    const amount = Math.max(Number(quantity) || 0, 0);
    const awarded = points == null ? definition.defaultPoints * amount : Math.max(Number(points) || 0, 0);
    const { data, error } = await supabase.rpc('record_progression_metric_event', { p_metric: metric, p_source_type: definition.sourceType, p_source_id: sourceId, p_quantity: amount, p_points_awarded: Math.round(awarded), p_metadata: metadata || {} });
    if (error) throw error;
    return data;
  }
  async function summary() {
    const { data, error } = await supabase.from('user_progression_metric_summary').select('*');
    if (error) throw error;
    return data || [];
  }
  return Object.freeze({ record, summary, metrics: METRICS });
}
export { METRICS };
