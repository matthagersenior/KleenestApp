/* Kleenest Maps Renderer — subordinate renderer owned by Maps Core. */
import { trustBadge } from './maps-trust.js';

export function createMapsRenderer({ provider = null } = {}) {
  let mountRoot = null;
  let map = null;
  let markerLayer = null;
  let routeLayer = null;
  let userMarker = null;
  let markers = new Map();
  let lastRenderSignature = '';

  const coords = x => {
    const lat = Number(x?.latitude ?? x?.lat);
    const lng = Number(x?.longitude ?? x?.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  };

  const esc = v => String(v ?? '').replace(/[&<>\"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;'
  }[c]));

  const identityFor = x => {
    const source = String(x?.source ?? x?.source_type ?? '').trim().toLowerCase();
    const external = String(x?.source_external_id ?? x?.external_id ?? '').trim();
    return external ? `${source}:${external}` : String(x?.id ?? '');
  };

  const renderSignatureFor = x => JSON.stringify([
    identityFor(x), x?.latitude ?? x?.lat ?? null, x?.longitude ?? x?.lng ?? null,
    x?.name ?? x?.title ?? '', x?.address ?? '', x?.place_type ?? '',
    x?.city ?? '', x?.state ?? '', x?.trust_level ?? '', x?.verification_status ?? '',
    x?.source ?? x?.source_type ?? '', x?.source_external_id ?? x?.external_id ?? ''
  ]);

  const iconFor = x => {
    const type = String(x?.place_type || 'place').toLowerCase();
    const cls = type === 'restroom' || type === 'toilets' ? 'restroom' : type === 'gas_station' ? 'gas' : type === 'cafe' ? 'cafe' : type === 'park' ? 'park' : type === 'hospital' ? 'hospital' : type === 'fast_food' ? 'food' : 'place';
    const glyph = cls === 'restroom' ? 'WC' : cls === 'gas' ? '⛽' : cls === 'cafe' ? '☕' : cls === 'park' ? '🌳' : cls === 'hospital' ? '✚' : cls === 'food' ? '🍴' : '●';
    return L.divIcon({ className: 'kleenest-map-pin', html: `<span class="kleenest-map-pin__glyph ${cls}" aria-hidden="true">${glyph}</span>`, iconSize: [38, 46], iconAnchor: [19, 43], popupAnchor: [0, -40] });
  };

  const popupHtml = x => {
    const title = x.name || x.title || 'Kleenest location';
    const trust = trustBadge(x);
    return `<div class="maps-popup"><strong>${esc(title)}</strong><span class="maps-badge ${esc(trust.className)}">${esc(trust.label)}</span><span>${esc(x.address || [x.city, x.state].filter(Boolean).join(', ') || 'Community location')}</span><div class="maps-popup__actions"><button type="button" data-map-location="${esc(identityFor(x))}">Details</button><button type="button" data-map-route="${esc(identityFor(x))}">Add to route</button></div></div>`;
  };

  function bindPopupActions(marker, x, context) {
    marker.off('popupopen');
    marker.off('click');
    marker.on('popupopen', () => {
      const el = marker.getPopup()?.getElement();
      if (!el) return;
      const details = el.querySelector('[data-map-location]');
      const route = el.querySelector('[data-map-route]');
      if (details) details.onclick = () => context.core.selectLocation(x.id).catch(console.error);
      if (route) route.onclick = () => Promise.resolve(context.modules.routes?.addLocation?.(x.id)).then(() => context.core.openRoute()).catch(console.error);
    });
    marker.on('click', () => context.core.selectLocation(x.id).catch(console.error));
  }

  function reconcileMarkers(locations, context) {
    const next = new Map();
    for (const x of locations) {
      const key = identityFor(x);
      if (!key) continue;
      const c = coords(x);
      if (!c) continue;
      const signature = renderSignatureFor(x);
      const existing = markers.get(key);
      if (existing && existing._kleenestRenderSignature === signature) {
        bindPopupActions(existing, x, context);
        next.set(key, existing);
        continue;
      }
      if (existing) markerLayer.removeLayer(existing);
      const marker = L.marker(c, { icon: iconFor(x), riseOnHover: true, keyboard: true, title: x.name || 'Kleenest location' }).addTo(markerLayer);
      marker.bindPopup(popupHtml(x));
      marker._kleenestRenderSignature = signature;
      bindPopupActions(marker, x, context);
      next.set(key, marker);
    }
    for (const [key, marker] of markers) {
      if (!next.has(key)) markerLayer.removeLayer(marker);
    }
    markers = next;
  }

  function paintLocations(locations = [], context, { recenter = false } = {}) {
    if (!map || !markerLayer) return;
    const valid = (Array.isArray(locations) ? locations : []).map(x => ({ x, c: coords(x) })).filter(v => v.c);
    const signature = valid.map(({ x }) => renderSignatureFor(x)).join('||');
    if (signature !== lastRenderSignature) {
      reconcileMarkers(valid.map(v => v.x), context);
      lastRenderSignature = signature;
    } else {
      // Rebind callbacks even when data is visually unchanged so consumers use current Core context.
      for (const x of valid.map(v => v.x)) {
        const marker = markers.get(identityFor(x));
        if (marker) bindPopupActions(marker, x, context);
      }
    }
    const count = mountRoot?.querySelector('[data-map-count]');
    if (count) count.textContent = `${valid.length} nearby locations`;
    const list = mountRoot?.querySelector('[data-map-list]');
    if (list) {
      list.innerHTML = valid.length ? valid.slice(0, 100).map(({ x }) => {
        const t = trustBadge(x);
        return `<div class="maps-location-card"><button class="maps-location-row" type="button" data-map-row="${esc(identityFor(x))}"><span><strong>${esc(x.name || 'Kleenest location')}</strong><small>${esc(x.address || x.place_type || 'Nearby')}</small></span><span class="maps-location-row__trust"><span class="maps-badge ${esc(t.className)}">${esc(t.label)}</span></span></button><div class="maps-location-card__actions"><button type="button" data-card-details="${esc(identityFor(x))}">Details</button><button type="button" data-card-route="${esc(identityFor(x))}">Route</button><button type="button" data-card-favorite="${esc(identityFor(x))}">Favorite</button></div></div>`;
      }).join('') : '<div class="maps-empty k-empty"><h3>No locations matched</h3><p>Try another amenity or move the map to another area.</p></div>';
      list.querySelectorAll('[data-map-row],[data-card-details]').forEach(b => b.onclick = () => context.core.selectLocation(b.dataset.mapRow || b.dataset.cardDetails).catch(console.error));
      list.querySelectorAll('[data-card-route]').forEach(b => b.onclick = () => Promise.resolve(context.modules.routes?.addLocation?.(b.dataset.cardRoute)).then(() => context.core.openRoute()).catch(console.error));
      list.querySelectorAll('[data-card-favorite]').forEach(b => b.onclick = () => Promise.resolve(context.modules.details?.open?.(b.dataset.card-favorite, { state: context.state, user: context.user })).then(r => r?.actions?.favorite?.(true)).catch(console.error));
    }
  }

  async function mount(root, context) {
    mountRoot = root;
    if (provider?.mount) return provider.mount(root, context);
    root.innerHTML = '<div class="maps-renderer"><div class="maps-renderer__toolbar"><div><strong>Nearby clean places</strong><span data-map-count>Searching…</span></div></div><div class="maps-renderer__layout"><div class="maps-renderer__map" data-map-canvas aria-label="Kleenest map"></div><aside class="maps-renderer__list" aria-label="Nearby locations"><div data-map-list><div class="k-skeleton" style="height:80px;margin:10px"></div></div></aside></div><section class="maps-navigation-panel" data-map-navigation hidden><div><span>NEXT MANEUVER</span><strong data-nav-instruction>Following route</strong><span data-nav-distance></span></div></section></div>';
    if (typeof L === 'undefined') throw new Error('Leaflet must be loaded by Maps Core before the renderer mounts');
    map = L.map(root.querySelector('[data-map-canvas]'), { zoomControl: true, preferCanvas: true }).setView([38.5, -89.9], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    routeLayer = L.geoJSON(null, { style: { weight: 6, opacity: .84 } }).addTo(map);
    root.querySelector('[data-map-canvas]')._kleenestMap = map;
  }

  function refresh(context, opts = {}) {
    if (!context?.core) return Promise.resolve([]);
    if (!opts.skipCore) return context.core.refreshDiscovery({ ...opts, skipRender: true });
    const locations = context.state.locations || [];
    paintLocations(locations, context, opts);
    return Promise.resolve(locations);
  }

  function updateUserPosition(position, center = false) {
    const c = position?.coords ? coords({ latitude: position.coords.latitude, longitude: position.coords.longitude }) : coords(position);
    if (!map || !c) return;
    if (userMarker) userMarker.setLatLng(c);
    else userMarker = L.circleMarker(c, { radius: 8, weight: 3 }).addTo(map).bindTooltip('You are here');
    if (center) map.setView(c, 14);
    return c;
  }

  function centerOnUser(position) {
    const c = position?.coords ? coords({ latitude: position.coords.latitude, longitude: position.coords.longitude }) : coords(position);
    if (map && c) map.setView(c, 14);
  }

  function selectMarker(id) {
    const marker = markers.get(String(id));
    if (marker) { map?.panTo(marker.getLatLng(), { animate: false }); marker.openPopup(); }
  }

  function updateNavigation(state) {
    const panel = mountRoot?.querySelector('[data-map-navigation]');
    if (!panel) return;
    panel.hidden = !state?.active;
  }

  function setRouteGeometry(geometry) {
    if (!map || !routeLayer || !geometry) return;
    routeLayer.clearLayers();
    routeLayer.addData(geometry);
    try { map.fitBounds(routeLayer.getBounds(), { padding: [32, 32], maxZoom: 16 }); } catch (_) {}
    return geometry;
  }

  function destroy() {
    provider?.destroy?.();
    if (map) map.remove();
    map = null;
    markerLayer = null;
    routeLayer = null;
    userMarker = null;
    markers.clear();
    markers = new Map();
    mountRoot = null;
    lastRenderSignature = '';
  }

  return Object.freeze({ mount, refresh, setRouteGeometry, updateUserPosition, centerOnUser, selectMarker, updateNavigation, destroy });
}
