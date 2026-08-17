import {createBusinessValueCore} from './business-value-core.js';
import {createBusinessCrudCore} from './business-crud-core.js';

const getSupabase=()=>window.KleenestSupabase?.getClient?.()||window.KleenestSupabase?.client||window.supabaseClient||null;
const getUser=()=>window.KleenestAuth?.user||window.currentUser||null;

window.KleenestBusinessCore={
  create:(options={})=>{
    const supabase=options.supabase||getSupabase();
    const user=options.user||getUser();
    const progression=options.progression||window.KleenestProgressionCore||window.KleenestProgressionActionBridgeV1||null;
    const valueCore=options.valueCore||createBusinessValueCore({supabase,user,progression});
    const crud=createBusinessCrudCore({supabase,user,valueCore});
    return Object.freeze({value:valueCore,crud});
  },
  ready:true
};
