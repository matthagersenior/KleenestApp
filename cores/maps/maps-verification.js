/* Maps Verification Module — explicit community and trusted/geofenced verification modes. */
export function createMapsVerification({supabase,progression=null,user=null}={}){
 const auth=()=>{if(!user?.id)throw new Error('Authentication is required for verification.')};
 async function call(locationId,evidence={},mode){auth();const lat=evidence.lat??null,lng=evidence.lng??null,hasBathroom=Boolean(evidence.hasPublicBathroom??evidence.has_bathroom);const args={p_location_id:locationId,p_has_public_bathroom:hasBathroom,p_lat:lat,p_lng:lng,p_distance_meters:mode==='trusted'?(evidence.distanceMeters??null):null};const {data,error}=await supabase.rpc('record_bathroom_verification',args);if(error)throw error;await progression?.record?.({metric:'location_verified',source_type:'verification',source_id:locationId,payload:{mode,hasBathroom,distanceMeters:evidence.distanceMeters??null}});return data}
 async function community({locationId,evidence={}}={}){return call(locationId,evidence,'community')}
 async function trusted({locationId,evidence={}}={}){return call(locationId,evidence,'trusted')}
 async function verify({locationId,evidence={},method='community'}={}){return method==='trusted'?trusted({locationId,evidence}):community({locationId,evidence})}
 return Object.freeze({verify,community,trusted,modes:Object.freeze(['community','trusted'])})
}