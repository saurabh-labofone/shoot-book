// Shoot Book service worker: the app opens with no signal. Data sync is separate (page code + phone storage).
const V='sb-3d12d79448', SHELL=["./","index.html","manifest.json","icon-180.png","icon-512.png","img/s10.jpg","img/s100.jpg","img/s101.jpg","img/s11.jpg","img/s12.jpg","img/s20.jpg","img/s21.jpg","img/s22.jpg","img/s30.jpg","img/s31.jpg","img/s32.jpg","img/s40.jpg","img/s41.jpg","img/s42.jpg","img/s50.jpg","img/s51.jpg","img/s52.jpg","img/s60.jpg","img/s61.jpg","img/s62.jpg","img/s70.jpg","img/s71.jpg","img/s80.jpg","img/s81.jpg","img/s82.jpg","img/s90.jpg","img/s91.jpg"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='sb-fonts').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request, u=new URL(r.url);
  if(r.method!=='GET') return;
  if(u.hostname.endsWith('supabase.co')) return;
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open('sb-fonts').then(async c=>{const hit=await c.match(r); const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>hit); return hit||net;})); return;
  }
  if(u.origin!==location.origin) return;
  if(r.mode==='navigate'){ // newest page when online, cached page when not
    // weak signal: wait 2.5 s for the network, then open the saved page at once
    const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone(); caches.open(V).then(c=>c.put('index.html',cp));} return res});
    const saved=new Promise(ok=>setTimeout(()=>caches.match('index.html').then(ok),2500));
    e.respondWith(Promise.race([net.catch(()=>caches.match('index.html')), saved.then(h=>h||net)]).then(x=>x||net)); return;
  }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r)));
});
