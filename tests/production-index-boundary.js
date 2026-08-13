/* Release gate: production index must not remain the legacy localStorage monolith. */
'use strict';
const fs=require('fs');
const index=fs.readFileSync('index.html','utf8');
const forbidden=[
  {name:'legacy local DB',pattern:/const\s+DB\s*=\s*\{/},
  {name:'legacy session state',pattern:/state\.session\s*=/},
  {name:'legacy login handler',pattern:/data-do-login/},
  {name:'legacy signup handler',pattern:/data-do-signup/},
  {name:'legacy business signup handler',pattern:/data-do-biz-signup/},
  {name:'legacy password records',pattern:/password\s*:\s*['"]demo123['"]|password\s*:\s*['"]admin123['"]/},
  {name:'local database persistence',pattern:/localStorage\.(getItem|setItem|removeItem)\(/}
];
const hits=forbidden.filter(x=>x.pattern.test(index));
if(hits.length){throw new Error('Production index is still legacy monolith: '+hits.map(x=>x.name).join(', '));}
if(!/kleenest-supabase-runtime\.js/.test(index))throw new Error('Production index must load the modular Supabase runtime.');
console.log('Production index boundary passed.');
