/* Maps Routing Provider: isolated cross-network routing request. */
export function createMapsRouting({endpoint='https://router.project-osrm.org/route/v1/driving'}={}){
 const point=p=>{const lat=Number(p?.latitude??p?.lat),lng=Number(p?.longitude??p?.lng);if(!Number.isFinite(lat)||!Number.isFinite(lng))throw new Error('Route points require valid coordinates.');return `${lng},${lat}`};
 async function request(points){const url=`${endpoint}/${points.map(point).join(';')}?overview=full&geometries=geojson&steps=true`;const response=await fetch(url,{headers:{Accept:'application/json'}});if(!response.ok)throw new Error(`Routing request failed (${response.status}).`);const json=await response.json();if(json.code!=='Ok'||!json.routes?.[0])throw new Error('No drivable route was found.');const r=json.routes[0];return {distanceMeters:r.distance,durationSeconds:r.duration,geometry:r.geometry,steps:r.legs?.flatMap(l=>l.steps||[])||[],raw:r};}
 async function preview(points){return request(points)}
 async function optimize({origin=null,destination=null,stops=[]}){
  if(stops.length<3)return stops.slice();
  const orderedInput=[...(origin?[origin]:[]),...stops,...(destination?[destination]:[])];
  const tripEndpoint=endpoint.replace(/\/route\/v1\/([^/]+)$/,'/trip/v1/$1');
  if(tripEndpoint===endpoint)return stops.slice();
  const coordinates=orderedInput.map(point).join(';');
  const params=new URLSearchParams({overview:'false',steps:'false',source:origin?'first':'any',destination:destination?'last':'any',roundtrip:destination?'false':'true'});
  const response=await fetch(`${tripEndpoint}/${coordinates}?${params}`,{headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error(`Route optimization request failed (${response.status}).`);
  const json=await response.json();
  if(json.code!=='Ok'||!json.trips?.[0]||!Array.isArray(json.waypoints))return stops.slice();
  const waypoints=json.waypoints
    .map((w,i)=>({w,i}))
    .filter(({w})=>Number.isInteger(w.waypoint_index))
    .sort((a,b)=>a.w.waypoint_index-b.w.waypoint_index);
  const startIndex=origin?1:0;
  const endIndex=destination?orderedInput.length-1:orderedInput.length;
  return waypoints
    .filter(({i})=>i>=startIndex&&i<endIndex)
    .map(({i})=>stops[i-startIndex])
    .filter(Boolean);
 }
 return Object.freeze({preview,optimize});
}