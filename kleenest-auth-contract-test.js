/* Signup contract: UI-independent path must remain callable after modal refactors. */
'use strict';
const fs=require('fs');
const c=fs.readFileSync('kleenest-auth-signup-controller.js','utf8');
const s=fs.readFileSync('kleenest-supabase.js','utf8');
const u=fs.readFileSync('kleenest-ui-integration.js','utf8');
for(const x of ['A.submit','A.bind','A.bindAll','kleenest:signup-success','kleenest:signup-error'])if(!c.includes(x))throw new Error(`Signup contract missing ${x}`);
if(!s.includes('auth.signUp'))throw new Error('Supabase signup path missing');
if(!u.includes('kleenest-auth-signup-controller.js'))throw new Error('Signup controller not critical');
console.log('Signup contract passed.');
