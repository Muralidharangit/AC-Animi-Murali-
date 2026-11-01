// Serves the renderer, launches Chrome on the GPU, writes each frame as raw RGBA (flipped by encode).
const http=require('http'),fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const [,,dir,w,frames,outDir]=process.argv;
let ch;const srv=http.createServer((q,s)=>{
 if(q.method==='POST'){const b=[];q.on('data',d=>b.push(d));q.on('end',()=>{const body=Buffer.concat(b);
   if(q.url==='/log')console.log(body.toString());
   else if(q.url==='/done'){console.log('done');s.end();ch.kill();setTimeout(()=>process.exit(0),200);return}
   else fs.writeFileSync(`${outDir}/${q.url.split('/').pop().padStart(3,'0')}.rgba`,body);
   s.end()});return}
 const f=path.join(dir,q.url.split('?')[0]);fs.readFile(f,(e,d)=>{if(e){s.statusCode=404;return s.end()}s.setHeader('Content-Type',f.endsWith('.html')?'text/html':f.endsWith('.webp')?'image/webp':'text/plain');s.end(d)})});
srv.listen(0,'127.0.0.1',()=>{const port=srv.address().port;
 ch=spawn('google-chrome',['--headless=new','--no-sandbox','--enable-gpu','--ignore-gpu-blocklist','--use-angle=gl-egl','--disable-gpu-watchdog','--disable-background-timer-throttling',`--user-data-dir=${dir}/chrome-render`,`--window-size=400,300`,`http://127.0.0.1:${port}/render.html?w=${w}&f=${frames}${process.argv[6]||''}`],{stdio:'ignore'});});
