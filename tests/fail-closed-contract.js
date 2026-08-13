/* Security/release rule: incomplete modular dependencies must never report acceptance success. */
'use strict';
const fs=require('fs');
const acceptance=fs.readFileSync('kleenest-acceptance-checks.js','utf8');
const health=fs.readFileSync('kleenest-runtime-health.js','utf8');
if(!acceptance.includes('missingDependencies'))throw new Error('Acceptance harness must expose missing dependencies.');
if(!acceptance.includes("modular_dependencies_incomplete"))throw new Error('Acceptance harness must fail closed.');
if(!acceptance.includes('if(missing.length)return'))throw new Error('Acceptance harness missing fail-closed branch.');
if(!health.includes('KleenestAccountLifecycle')||!health.includes('KleenestAccountUI')||!health.includes('kleenestBusinessAnalytics'))throw new Error('Runtime health does not cover critical modular layers.');
console.log('Fail-closed contract passed.');
