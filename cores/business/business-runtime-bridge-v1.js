import {createBusinessValueCore} from './business-value-core.js';

const getSupabase=()=>window.KleenestSupabase?.getClient?.()||window.KleenestSupabase?.client||window.supabaseClient||null;
const getUser=()=>window.KleenestAuth?.user||window.currentUser||null;

window.KleenestBusinessCore={
  create:(options={})=>createBusinessValueCore({supabase:options.supabase||getSupabase(),user:options.user||getUser(),progression:options.progression||window.KleenestProgressionCore||null}),
  ready:true
};
