import {createBusinessValueCore} from './business-value-core.js';
import {createBusinessCrudCore} from './business-crud-core-v1.js';

const getSupabase=()=>window.KleenestSupabase?.getClient?.()||window.KleenestSupabase?.client||window.supabaseClient||null;
const getUser=()=>window.KleenestAuth?.user||window.currentUser||null;

window.KleenestBusinessCore={
 create:(options={})=>{
  const supabase=options.supabase||getSupabase();
  const user=options.user||getUser();
  const value=createBusinessValueCore({supabase,user,progression:options.progression||window.KleenestProgressionCore||null});
  const crud=createBusinessCrudCore({supabase,user,businessValue:value});
  return Object.freeze({...value,crud});
 },
 ready:true,
 version:'2'
};
