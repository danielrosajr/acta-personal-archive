/* ACTA offline cache. No remote API calls, no private records stored in CacheStorage. */
const CACHE='acta-shell-v0.2.0-alpha-1';
const BASE=self.registration.scope;
self.addEventListener('install', event => {
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    const response=await fetch(BASE,{cache:'reload'});
    if(!response.ok)throw new Error('ACTA shell unavailable');
    await cache.put(BASE,response.clone());
    const html=await response.text();
    const assets=[...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map(m=>new URL(m[1],BASE).href)
      .filter(url=>url.startsWith(BASE)&&/\.(?:js|css|svg|png|webp)(?:\?|$)/.test(url));
    await cache.addAll([...new Set(assets)]);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('acta-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  const url=new URL(request.url);
  if(!url.pathname.startsWith(new URL(BASE).pathname))return;
  if(request.mode==='navigate') {
    event.respondWith(fetch(request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(BASE,copy));}
      return response;
    }).catch(()=>caches.match(BASE)));
  } else {
    event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}
      return response;
    })));
  }
});
