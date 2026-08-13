/* Ensure runtime diagnostics stay read-only and cover the modular dependency graph. */
'use strict';
const fs=require('fs');
const src=fs.readFileSync('kleenest-runtime-health.js','utf8');
for(const name of ['KleenestSupabase','KleenestRuntime','KleenestBusinessData','KleenestPartnershipUI','kleenestAcceptance','KleenestSessionBridge','kleenestLegacyAuthGuard'])if(!src.includes(`'${name}'`))throw new Error(`Runtime health dependency missing: ${name}`);
for(const marker of ['snapshot','check','getSession','runtime-health'])if(!src.includes(marker))throw new Error(`Runtime health contract missing: ${marker}`);
if(/\b(insert|update|delete|rpc)\s*\(/i.test(src))throw new Error('Runtime health must remain read-only.');
console.log('Runtime health contract checks passed.');
