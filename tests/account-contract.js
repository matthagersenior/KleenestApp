/* Static regression checks for account lifecycle/UI wiring. */
'use strict';
const fs=require('fs');
const ui=fs.readFileSync('kleenest-account-ui.js','utf8');
const lifecycle=fs.readFileSync('kleenest-account-lifecycle.js','utf8');
const requiredUI=['data-account-delete','setAttribute(\'type\',\'button\')','stopImmediatePropagation','KleenestAccountLifecycle.requestDeletion(reason)'];
const requiredLifecycle=["getSession()","request_account_deletion","p_reason","slice(0,500)"];
for(const marker of requiredUI)if(!ui.includes(marker))throw new Error(`Missing account UI contract: ${marker}`);
for(const marker of requiredLifecycle)if(!lifecycle.includes(marker))throw new Error(`Missing account lifecycle contract: ${marker}`);
if(!/reason===null/.test(ui))throw new Error('Deletion flow must allow cancellation before submission.');
if(!/button\.disabled=true/.test(ui)||!/button\.disabled=false/.test(ui))throw new Error('Deletion control must have busy-state protection.');
console.log('Account lifecycle/UI contract checks passed.');
