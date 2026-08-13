/* Verify the browser Supabase boundary stays centralized and auditable. */
'use strict';
const fs=require('fs');
const client=fs.readFileSync('kleenest-supabase.js','utf8');
const runtime=fs.readFileSync('kleenest-supabase-runtime.js','utf8');
const required=['signIn','signUp','signOut','session','rpc','profile','businessMemberships','provision','preferredEligibility','activatePreferred','usePreferred','createBusiness'];
for(const name of required)if(!client.includes(`function ${name}(`))throw new Error(`Supabase boundary missing ${name}`);
if(!client.includes('window.KleenestSupabase='))throw new Error('Shared Supabase facade missing.');
if((client.match(/createClient\(/g)||[]).length!==1)throw new Error('Multiple Supabase client creation sites detected in shared client.');
if(!client.includes("persistSession:true"))throw new Error('Supabase session persistence unexpectedly disabled.');
if(!client.includes("detectSessionInUrl:true"))throw new Error('Supabase auth callback detection unexpectedly disabled.');
if(!runtime.includes('window.KleenestSupabase'))throw new Error('Runtime is not connected to shared Supabase facade.');
console.log('Supabase boundary contract checks passed.');
