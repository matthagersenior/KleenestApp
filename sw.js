const CACHE='kleenest-shell-v1';
const SHELL=['/','/index.html','/manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const r=event.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;if(u.pathname.startsWith('/rest/')||u.pathname.startsWith('/auth/')||u.pathname.includes('supabase'))return;event.respondWith(fetch(r).catch(()=>caches.match(r).then(x=>x||caches.match('/index.html'))));});
