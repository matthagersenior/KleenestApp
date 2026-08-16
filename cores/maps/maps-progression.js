/* Maps Progression Module: the single scoring boundary for Maps activity. */
export function createMapsProgression({ progressionCore=null }={}) {
  async function record(event={}) {
    if (!event.metric) throw new Error('Maps progression metric is required.');
    const actionMap={route_started:'route_start',route_stop_completed:'route_stop_complete',route_completed:'route_complete',route_shared:'route_share',location_check_in:'check_in',location_favorited:'favorite',location_verified:'verification'};
    const action=actionMap[event.metric]||event.metric;
    if (typeof progressionCore?.record === 'function') return progressionCore.record(event);
    if (typeof progressionCore?.recordAction === 'function') return progressionCore.recordAction(action,event.source_id||null);
    if (typeof window!=='undefined' && window.KleenestProgression?.recordAction) return window.KleenestProgression.recordAction(action,event.source_id||null);
    return null;
  }
  return Object.freeze({record});
}