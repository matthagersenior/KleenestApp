/* Current index contract: until migration is complete, make its status explicit and safe. */
'use strict';
const fs=require('fs');
const index=fs.readFileSync('index.html','utf8');
if(!index.includes('kleenest-supabase-runtime.js'))throw new Error('Current index must retain the modular runtime during migration.');
if(index.includes('kleenest-db-v11') && !index.includes('LIVE DEMO'))throw new Error('Legacy storage index must be explicitly identified as a demo/reference surface.');
if(!index.includes('LIVE DEMO') && index.includes('kleenest-db-v11'))console.warn('Legacy database detected; promotion gate remains active.');
console.log('Production index migration contract passed.');
