/* Maps Navigation Core — canonical, mobile-safe navigation state. */
export function createMapsNavigation({ location, routes, onChange = () => {}, arrivalRadiusMeters = 75 } = {}) {
  let active = false;
  let watching = false;
  let currentStopIndex = 0;
  let currentStepIndex = 0;
  let completed = new Set();
  let stops = [];
  let routeData = null;

  function distance(a, b) {
    const R = 6371000;
    const la = Number(a.latitude) * Math.PI / 180;
    const lb = Number(b.latitude) * Math.PI / 180;
    const dLat = (Number(b.latitude) - Number(a.latitude)) * Math.PI / 180;
    const dLon = (Number(b.longitude) - Number(a.longitude)) * Math.PI / 180;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function syncStops() {
    stops = routes && typeof routes.getStops === 'function' ? (routes.getStops() || []) : [];
    currentStopIndex = Math.min(currentStopIndex, Math.max(0, stops.length - 1));
  }

  function currentStep() {
    const steps = routeData && Array.isArray(routeData.steps) ? routeData.steps : [];
    return steps[currentStepIndex] || null;
  }

  function stepPoint(step) {
    const c = step && step.maneuver && step.maneuver.location;
    if (!Array.isArray(c) || c.length < 2) return null;
    return { longitude: Number(c[0]), latitude: Number(c[1]) };
  }

  function updateManeuver(point) {
    const steps = routeData && Array.isArray(routeData.steps) ? routeData.steps : [];
    if (!steps.length) return null;
    let index = currentStepIndex;
    for (let i = index; i < steps.length; i += 1) {
      const target = stepPoint(steps[i]);
      if (!target) continue;
      const meters = distance(point, target);
      if (meters < 35) index = i + 1;
      else if (meters < 150) { index = i; break; }
    }
    currentStepIndex = Math.min(index, Math.max(0, steps.length - 1));
    const step = currentStep();
    if (!step) return null;
    const target = stepPoint(step);
    return {
      step,
      distanceMeters: target ? Math.round(distance(point, target)) : null,
      stepIndex: currentStepIndex,
      totalSteps: steps.length
    };
  }

  async function update(position) {
    if (!active || !position || !position.coords) return;
    syncStops();
    const point = {
      latitude: Number(position.coords.latitude),
      longitude: Number(position.coords.longitude)
    };
    const maneuver = updateManeuver(point);
    if (!stops.length) {
      onChange({ position: point, progress: 0, maneuver });
      return;
    }
    const stop = stops[currentStopIndex];
    if (!stop) {
      onChange({ position: point, progress: completed.size / stops.length, maneuver });
      return;
    }
    const loc = stop.locations || stop;
    const target = {
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude)
    };
    const meters = distance(point, target);
    if (meters <= arrivalRadiusMeters && !completed.has(stop.id)) {
      completed.add(stop.id);
      if (routes && typeof routes.completeStop === 'function') {
        try { await routes.completeStop(stop.id, { arrival_distance_meters: Math.round(meters), detected_by: 'gps' }); } catch (_) {}
      }
      currentStopIndex += 1;
      const progress = completed.size / stops.length;
      onChange({ position: point, arrived: true, stop, progress, maneuver });
      if (currentStopIndex >= stops.length) {
        if (routes && typeof routes.complete === 'function') {
          try { await routes.complete(); } catch (_) {}
        }
        onChange({ position: point, routeCompleted: true, progress: 1, maneuver });
      }
    } else {
      onChange({ position: point, distanceToNextStopMeters: Math.round(meters), nextStop: stop, progress: completed.size / stops.length, maneuver });
    }
  }

  function start() {
    if (active) return;
    syncStops();
    active = true;
    watching = true;
    if (location && typeof location.startWatch === 'function') location.startWatch();
    const state = location && typeof location.get === 'function' ? location.get() : null;
    if (state && state.position) update(state.position);
    onChange({ active: true, stops: stops.length, routeData, step: currentStep() });
  }

  function stop() {
    active = false;
    watching = false;
    if (location && typeof location.stopWatch === 'function') location.stopWatch();
    onChange({ active: false });
  }

  function reset() {
    completed = new Set();
    currentStopIndex = 0;
    currentStepIndex = 0;
    syncStops();
  }

  function setRouteData(data) {
    routeData = data || null;
    currentStepIndex = 0;
    onChange({ routeData, step: currentStep() });
    return routeData;
  }

  return Object.freeze({
    start,
    stop,
    reset,
    update,
    setRouteData,
    isActive: () => active,
    getState: () => ({ active, watching, currentStopIndex, completedStops: completed.size, totalStops: stops.length, currentStepIndex, step: currentStep() })
  });
}
