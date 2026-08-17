/* Maps Verification Module — live authority is trusted, geofenced verification. */
export function createMapsVerification({supabase,progression=null,user=null}={}){
 const auth=()=>{if(!user?.id)throw new Error('Authentication is required for verification.')};
 async function trusted({locationId,evidence={}}={}){auth();const lat=evidence.lat??null,lng=evidence.lng??null,hasBathroom=Boolean(evidence.hasPublicBathroom??evidence.has_bathroom);const args={p_location_id:locationId,p_has_public_bathroom:hasBathroom,p_lat:lat,p_lng:lng,p_distance_meters:evidence.distanceMeters??null};const {data,error}=await supabase.rpc('record_bathroom_verification',args);if(error)throw error;await progression?.record?.({metric:'location_verified',source_type:'verification',source_id:locationId,payload:{mode:'trusted',hasBathroom,distanceMeters:evidence.distanceMeters??null}});return data}
 async function verify({locationId,evidence={}}={}){return trusted({locationId,evidence})}
 return Object.freeze({verify,trusted,modes:Object.freeze(['trusted'])});
}