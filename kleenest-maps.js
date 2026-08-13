/* Modular Maps domain: location discovery, distance ordering, verification-aware filtering and Details handoff. */
(function(){'use strict';
 const M=window.KleenestMaps=window.KleenestMaps||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Supabase maps boundary unavailable');return api.rpc(name,args)};
 M.listNearby=(lat,lon,radiusMiles=25)=>rpc('get_nearby_locations',{p_lat:lat,p_lon:lon,p_radius_miles:radiusMiles});
 M.getLocation=(id)=>rpc('get_location_details',{p_location_id:id});
 M.distanceMiles=(a,b)=>{const R=3958.7613,rad=x=>x*Math.PI/180;const dLat=rad(b.lat-a.lat),dLon=rad(b.lng-a.lng);const x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x));};
 M.sortByDistance=(locations,origin)=>[...(locations||[])].map(x=>({...x,_distance:M.distanceMiles(origin,{lat:Number(x.lat),lng:Number(x.lng)})})).sort((a,b)=>a._distance-b._distance);
 M.filter=(locations,{verifiedOnly=false,preferredOnly=false,favoritesOnly=false,minRating=0}={})=>(locations||[]).filter(x=>(!verifiedOnly||['verified','confirmed'].includes(String(x.verification_status||x.verificationStatus)))&&(!preferredOnly||!!x.preferred)&&(!favoritesOnly||!!x.is_favorite)&&Number(x.rating||0)>=minRating);
 M.prepareDetails=(location)=>({location,canFavorite:!!window.KleenestSocial,canReview:!!window.KleenestSupabase,canCheckIn:!!window.KleenestSupabase,canRoute:!!window.KleenestRoute});
})();
