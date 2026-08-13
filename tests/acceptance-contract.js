/* Ensure the runtime acceptance harness covers every critical modular dependency. */
'use strict';
const fs=require('fs');
const src=fs.readFileSync('kleenest-acceptance-checks.js','utf8');
const deps=['supabase','auth','preferredAccess','preferredActivation','preferredVisit','visitTracking','businessData','businessAnalytics','partnerPrograms','partnershipUi','sessionBridge','legacyAuthGuard','accountLifecycle','accountUi','runtimeHealth'];
for(const key of deps)if(!src.includes(`${key}:`))throw new Error(`Acceptance dependency missing: ${key}`);
for(const fn of ['runtimeHealth','session','demoNetwork','partnerships','program','preferredEligibility','preferredAnalytics','accountLifecycle','runAll'])if(!src.includes(`api.${fn}`))throw new Error(`Acceptance check missing: ${fn}`);
for(const rpc of ['demo_network_health'])if(!src.includes(rpc))throw new Error(`Acceptance RPC missing: ${rpc}`);
if(!src.includes('Promise.all'))throw new Error('Acceptance suite must execute independent checks concurrently.');
console.log('Acceptance harness contract checks passed.');
