const METRICS = Object.freeze({
  social_post: { sourceType: 'social_post', label: 'Posts', defaultPoints: 10 },
  social_comment: { sourceType: 'social_comment', label: 'Helpful comments', defaultPoints: 3 },
  social_like: { sourceType: 'social_like', label: 'Reactions', defaultPoints: 1 },
  social_save: { sourceType: 'social_save', label: 'Saves', defaultPoints: 2 },
  social_follow: { sourceType: 'social_follow', label: 'Community connections', defaultPoints: 5 },
  contest_entry: { sourceType: 'contest', label: 'Contest entries', defaultPoints: 15 },
  game_play: { sourceType: 'game', label: 'Games played', defaultPoints: 10 },
  challenge_progress: { sourceType: 'challenge', label: 'Challenge progress', defaultPoints: 5 },
  event_rsvp: { sourceType: 'event', label: 'Event participation', defaultPoints: 10 },
  check_in: { sourceType: 'check_in', label: 'Check-ins', defaultPoints: 10 },
  review: { sourceType: 'review', label: 'Reviews', defaultPoints: 20 },
  verification: { sourceType: 'verification', label: 'Location verification', defaultPoints: 25 },
  route: { sourceType: 'route', label: 'Routes completed', defaultPoints: 15 },
  campaign_engagement: { sourceType: 'campaign', label: 'Campaign engagement', defaultPoints: 5 },
  promotion_redemption: { sourceType: 'promotion', label: 'Promotions redeemed', defaultPoints: 5 },
  qr_scan: { sourceType: 'qr_scan', label: 'QR scans', defaultPoints: 3 }
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
