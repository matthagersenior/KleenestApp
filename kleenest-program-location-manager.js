/* Program/location enrollment bridge. Server-side authorization remains authoritative. */
(function(){'use strict';
 async function rpc(name,args){if(!window.KleenestSupabase?.client)throw new Error('Supabase is not ready.');const {data,error}=await window.KleenestSupabase.client().rpc(name,args||{});if(error)throw error;return data;}
 async function enroll(programId,locationId){return rpc('enroll_program_location',{p_program_id:programId,p_location_id:locationId});}
 async function remove(programId,locationId){return rpc('remove_program_location',{p_program_id:programId,p_location_id:locationId});}
 async function list(programId){return rpc('list_program_locations',{p_program_id:programId});}
 window.kleenestProgramLocations={enroll,remove,list};
})();
