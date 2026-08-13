/* Demo-only reference must never be mistaken for production credentials. */
'use strict';
const fs=require('fs');
const index=fs.readFileSync('index.html','utf8');
const status=fs.readFileSync('MIGRATION-STATUS.md','utf8');
if(index.includes('LIVE DEMO') && !status.includes('demo'))console.warn('Demo marker found without migration status reference.');
if(/password\s*[:=]\s*["'][^"']+["']/i.test(index)){
  if(!index.includes('LIVE DEMO'))throw new Error('Hardcoded demo password detected outside explicit demo surface.');
}
console.log('Demo-secret boundary contract passed.');
