/* Regression contract for modal/backdrop interaction semantics. */
'use strict';
const fs=require('fs');
const f=fs.readFileSync('kleenest-modal-interaction-fix.js','utf8');
if(!f.includes("document.addEventListener('click',guard,true)"))throw new Error('Modal click guard must run during capture.');
if(!f.includes("closest?.('.modal-box')"))throw new Error('Inside-dialog detection missing.');
if(!f.includes('data-close-modal')||!f.includes('data-close-family'))throw new Error('Both modal close boundaries must be guarded.');
console.log('Modal interaction contract passed.');
