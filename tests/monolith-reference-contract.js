/* Ensure the reference branch remains a real legacy demo, not an accidental modular copy. */
'use strict';
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
for(const marker of ['const DB =','kleenest-db-v11','localStorage.getItem','localStorage.setItem','data-quick-login','data-open-auth'])if(!html.includes(marker))throw new Error(`Legacy reference marker missing: ${marker}`);
if(!html.includes('kleenest-supabase-runtime.js'))throw new Error('Reference baseline must retain the migration runtime for comparison.');
console.log('Legacy monolith reference contract passed.');
