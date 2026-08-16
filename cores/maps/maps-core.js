/* Kleenest Maps Core
 * Authoritative modular Maps entry point for refactor/monolith-removal.
 * Modules are explicit and may be replaced independently without changing the shell contract.
 */

const DEFAULT_MODULES = [
  'location','discovery','cache','session','catalog','verification','engagement',
  'details','filters','renderer','routes','progression','social','business'
];

export function createMapsCore({ supabase, root, user = null, modules = {} } = {}) {
  if (!root) throw new Error('Maps Core requires a mount root.');
  const state = {
    user,
    destroyed: false,
    ready: false,
    modules: Object.freeze({ ...modules }),
    selectedLocationId: null,
    filters: {},
    locations: [],
    status: 'initializing'
  };

  const missing = DEFAULT_MODULES.filter(name => !state.modules[name]);

  function contract() {
    return Object.freeze({
      version: '1.0.0',
      core: 'maps',
      modules: DEFAULT_MODULES.slice(),
      required: ['location','discovery','cache','session','catalog','verification','engagement','details','filters','renderer','routes','progression','social','business'],
      missing
    });
  }

  async function initialize() {
    if (state.destroyed) return;
    state.status = 'initializing';
    root.replaceChildren();
    root.innerHTML = `<section class="maps-core" data-maps-core>
      <div class="maps-core__hero">
        <span class="maps-core__eyebrow">KLEENEST MAPS</span>
        <h1>Clean places, verified by the community.</h1>
        <p>Discover, verify, check in, favorite and navigate with one coordinated Maps experience.</p>
      </div>
      <div class="maps-core__status" data-maps-status>Preparing your map…</div>
      <div class="maps-core__surface" data-maps-surface></div>
    </section>`;

    // A missing module is an explicit configuration error, not a fallback path.
    if (missing.length) {
      state.status = 'configuration_error';
      root.querySelector('[data-maps-status]').textContent = `Maps Core is missing modules: ${missing.join(', ')}.`;
      return;
    }

    const context = { supabase, user: state.user, state, core: api };
    for (const name of DEFAULT_MODULES) {
      const mod = state.modules[name];
      if (typeof mod.initialize === 'function') await mod.initialize(context);
    }

    state.ready = true;
    state.status = 'ready';
    root.querySelector('[data-maps-status]').textContent = 'Maps ready.';
    if (typeof state.modules.renderer.mount === 'function') {
      await state.modules.renderer.mount(root.querySelector('[data-maps-surface]'), context);
    }
  }

  async function selectLocation(locationId) {
    if (!state.ready) throw new Error('Maps Core is not ready.');
    state.selectedLocationId = locationId;
    return state.modules.details?.open?.(locationId, { state, user: state.user });
  }

  async function refresh() {
    if (!state.ready) return initialize();
    const context = { supabase, user: state.user, state, core: api };
    if (typeof state.modules.discovery.refresh === 'function') {
      state.locations = await state.modules.discovery.refresh(context) || [];
    }
    if (typeof state.modules.renderer.refresh === 'function') {
      await state.modules.renderer.refresh(context);
    }
    return state.locations;
  }

  function setFilters(filters = {}) {
    state.filters = { ...filters };
    return state.modules.filters?.apply?.(state.filters, { state });
  }

  function destroy() {
    if (state.destroyed) return;
    const context = { supabase, user: state.user, state, core: api };
    for (const name of [...DEFAULT_MODULES].reverse()) {
      const mod = state.modules[name];
      try { mod?.destroy?.(context); } catch (error) { console.error(`[Maps Core] ${name} destroy failed`, error); }
    }
    state.destroyed = true;
    root.replaceChildren();
  }

  const api = Object.freeze({
    contract,
    initialize,
    refresh,
    selectLocation,
    setFilters,
    destroy,
    get state() { return { ...state, modules: undefined }; }
  });

  return api;
}
