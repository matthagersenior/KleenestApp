/* Canonical Business CRUD runtime. UI adapters must use this for registered business datasets. */
import {getBusinessFeature,businessFeatureAccess} from './business-feature-registry.js';

const MUTATION_ROLES=Object.freeze(['owner','admin','manager']);
const ID_RE=/^[A-Za-z0-9_-]{1,128}$/;

function cleanId(value){const id=String(value??'');if(!ID_RE.test(id))throw new Error('Invalid record identifier.');return id}
function cleanObject(value){if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('A record object is required.');const out={};for(const [k,v] of Object.entries(value)){if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(k))throw new Error('Invalid field name.');if(k==='id'||k==='business_id'||k==='created_at'||k==='updated_at')continue;out[k]=v}return out}

export function createBusinessCrudCore({supabase,user=null,businessValue=null}={}){
 if(!supabase)throw new Error('Business CRUD Core requires Supabase.');
 if(!businessValue)throw new Error('Business CRUD Core requires Business Value Core.');
 async function access(featureKey,businessId,account=user){
  const feature=getBusinessFeature(featureKey);if(!feature)return {allowed:false,reason:'unknown_feature'};
  if(!businessId||!account?.id)return {allowed:false,reason:'missing_context'};
  const caps=await businessValue.capabilities(businessId,account);
  const a=businessFeatureAccess(feature,{tier:caps.tier,role:caps.role,isAdmin:account?.is_admin===true});
  return {...a,businessId,feature};
 }
 async function requireAccess(featureKey,businessId,account=user,mutation=false){
  const a=await access(featureKey,businessId,account);if(!a.allowed)throw new Error(a.reason==='upgrade_required'?'This feature requires a Growth or Enterprise plan.':a.reason==='role_restricted'?'Your business role cannot modify this feature.':'You do not have access to this business feature.');
  if(mutation&&!account?.is_admin&&!MUTATION_ROLES.includes(String(a.role||'').toLowerCase()))throw new Error('Only an owner, admin, or manager can modify this feature.');
  return a;
 }
 async function list(featureKey,businessId,{filters={},limit=100,offset=0,orderBy='created_at',ascending=false,account=user}={}){
  const a=await requireAccess(featureKey,businessId,account,false);const table=a.feature.dataset;let q=supabase.from(table).select('*').eq('business_id',businessId);for(const [k,v] of Object.entries(filters||{})){if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(k))continue;if(v===null)q=q.is(k,null);else if(Array.isArray(v))q=q.in(k,v);else q=q.eq(k,v)};q=q.order(orderBy,{ascending:Boolean(ascending)}).range(Math.max(0,Number(offset)||0),Math.max(0,Number(offset)||0)+Math.min(Math.max(Number(limit)||100,1),200)-1);const {data,error}=await q;if(error)throw error;return data||[];
 }
 async function get(featureKey,businessId,id,{account=user}={}){const a=await requireAccess(featureKey,businessId,account,false);const {data,error}=await supabase.from(a.feature.dataset).select('*').eq('business_id',businessId).eq('id',cleanId(id)).maybeSingle();if(error)throw error;return data||null}
 async function create(featureKey,businessId,payload,{account=user}={}){const a=await requireAccess(featureKey,businessId,account,true);const body={...cleanObject(payload),business_id:businessId};const {data,error}=await supabase.from(a.feature.dataset).insert(body).select('*').single();if(error)throw error;await businessValue.metric('business_'+featureKey+'_created',data?.id,{businessId,feature:featureKey});return data}
 async function update(featureKey,businessId,id,payload,{account=user}={}){const a=await requireAccess(featureKey,businessId,account,true);const body=cleanObject(payload);if(!Object.keys(body).length)throw new Error('No editable fields supplied.');const {data,error}=await supabase.from(a.feature.dataset).update(body).eq('business_id',businessId).eq('id',cleanId(id)).select('*').single();if(error)throw error;await businessValue.metric('business_'+featureKey+'_updated',data?.id,{businessId,feature:featureKey});return data}
 async function remove(featureKey,businessId,id,{account=user}={}){const a=await requireAccess(featureKey,businessId,account,true);const record=await get(featureKey,businessId,id,{account});if(!record)throw new Error('Record not found.');const {error}=await supabase.from(a.feature.dataset).delete().eq('business_id',businessId).eq('id',cleanId(id));if(error)throw error;await businessValue.metric('business_'+featureKey+'_deleted',id,{businessId,feature:featureKey});return {id:String(id),deleted:true}}
 return Object.freeze({access,requireAccess,list,get,create,update,remove})
}
