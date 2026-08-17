/* P0 runtime contract v1: narrow compatibility boundaries only; never replaces Supabase SDK. */
(function(g){'use strict';
  if(g.KleenestP0RuntimeContractV1)return;
  function normalizeLocations(value){
    var v=value;
    if(v&&typeof v==='object'&&!Array.isArray(v)) v=v.data??v.locations??v.rows??v.results??v.items??v;
    return Array.isArray(v)?v:[];
  }
  function installBusinessRpcGuard(){
    var s=g.KleenestSupabase;
    if(!s||typeof s.rpc!=='function'||s.__p0RpcGuard)return false;
    var original=s.rpc.bind(s);
    s.rpc=function(name,args){
      return Promise.resolve(original(name,args)).then(function(result){
        if(String(name||'').toLowerCase()==='business_list_locations') return normalizeLocations(result);
        return result;
      });
    };
    s.__p0RpcGuard=true;
    return true;
  }
  function installMapsSocialBridge(){
    if(g.KleenestMapsSocialModuleV1)return true;
    g.KleenestMapsSocialModuleV1={
      initialize:async function(){},
      destroy:function(){},
      openLocation:async function(){return null},
      recordMapAction:async function(){return null}
    };
    if(!g.KleenestSocialCoreV12)g.KleenestSocialCoreV12=g.KleenestMapsSocialModuleV1;
    return true;
  }
  function install(){installBusinessRpcGuard();installMapsSocialBridge();}
  g.KleenestP0RuntimeContractV1={install:install,normalizeLocations:normalizeLocations};
  install();
})(window);