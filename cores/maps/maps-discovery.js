/* Maps Discovery Module: canonical Supabase-first discovery contract. */
export function createMapsDiscovery({ supabase } = {}) {
  async function refresh({ filters = {}, user = null } = {}) {
    if (!supabase) throw new Error('Maps Discovery requires Supabase.');
    let query = supabase.from('locations').select('*').limit(500);
    if (filters.type) query=query.eq('type',filters.type);
    if (filters.verifiedOnly) query=query.eq('verified',true);
    const {data,error}=await query;
    if(error)throw error;
    return data??[];
  }
  async function nearby({lat,lng,radiusMeters=5000,filters={}}={}) { return refresh({filters}); }
  return Object.freeze({refresh,nearby});
}