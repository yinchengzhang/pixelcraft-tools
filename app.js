const $=id=>document.getElementById(id);
const tools={
compress:['Compress Image to Target KB','Set a maximum file size in KB. The tool tries JPEG quality and image dimensions to reach it.'],
resize:['Resize Image','Enter your new width and height in pixels.'],
heic:['Convert HEIC to JPG','Convert an iPhone HEIC photo to JPEG in your browser.'],
webp:['Convert WebP to PNG','Convert a WebP image to a PNG without uploading it.'],
ratio:['Aspect Ratio Calculator','Simplify a width-to-height ratio or calculate matching dimensions.'],
discord:['Compress Image for Discord','Compress an image below your chosen upload size.']
};
let mode=new URLSearchParams(location.search).get('tool')||'compress';if(!tools[mode])mode='compress';
let file=null, outputUrl=null;
const fields={
compress:`<div class="field"><label for="kb">Maximum size (KB)</label><input id="kb" type="number" min="1" value="100"></div><div class="field"><label for="maxwidth">Maximum width (px)</label><input id="maxwidth" type="number" min="64" value="3000"></div>`,
resize:`<div class="field"><label for="width">Width (px)</label><input id="width" type="number" min="1" value="1200"></div><div class="field"><label for="height">Height (px)</label><input id="height" type="number" min="1" value="800"></div><div class="field"><label><input type="checkbox" id="lock" checked> Preserve aspect ratio</label></div><div class="field"><label for="format">Output format</label><select id="format"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option></select></div>`,
heic:'',webp:'',
ratio:`<div class="field"><label for="width">Width</label><input id="width" type="number" min="1" value="1920"></div><div class="field"><label for="height">Height</label><input id="height" type="number" min="1" value="1080"></div><div class="field"><label for="newwidth">New width (optional)</label><input id="newwidth" type="number" min="1" placeholder="e.g. 1280"></div>`,
discord:`<div class="field"><label for="mb">Maximum size (MB)</label><input id="mb" type="number" min=".1" step=".1" value="10"></div><div class="field"><label for="maxwidth">Maximum width (px)</label><input id="maxwidth" type="number" min="64" value="3000"></div>`
};
$('toolTitle').textContent=tools[mode][0];$('toolDesc').textContent=tools[mode][1];$('controls').innerHTML=fields[mode];document.title=tools[mode][0]+' — PixelCraft Tools';
if(mode==='ratio'){$('upload').style.display='none';$('run').textContent='Calculate';}
const show=(html)=>{$('result').style.display='block';$('result').innerHTML=html};
const fail=(msg)=>show('<strong>Error:</strong> '+msg.replace(/[<>&]/g,''));
function gcd(a,b){while(b)[a,b]=[b,a%b];return a}
function numeric(id){const v=Number($(id)?.value);if(!Number.isFinite(v)||v<=0)throw Error('Enter a positive value for '+id);return v}
function resetOutput(){if(outputUrl)URL.revokeObjectURL(outputUrl);outputUrl=null;$('result').style.display='none';$('preview').style.display='none'}
$('reset').onclick=()=>{file=null;$('file').value='';$('fileName').textContent='JPG, PNG, WebP, or HEIC (depending on tool)';resetOutput()};
function choose(f){if(!f)return;if(f.size>70*1024*1024){fail('File is too large (70 MB maximum).');return}file=f;resetOutput();$('fileName').textContent=f.name+' · '+(f.size/1024).toFixed(1)+' KB';if(f.type.startsWith('image/')&&!/heic|heif/.test(f.type)){let u=URL.createObjectURL(f);$('preview').src=u;$('preview').style.display='block';$('preview').onload=()=>URL.revokeObjectURL(u)}}
$('file').onchange=e=>choose(e.target.files[0]);$('upload').onclick=()=>$('file').click();$('upload').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('file').click()}};
$('upload').ondragover=e=>{e.preventDefault();$('upload').classList.add('drag')};$('upload').ondragleave=()=>$('upload').classList.remove('drag');$('upload').ondrop=e=>{e.preventDefault();$('upload').classList.remove('drag');choose(e.dataTransfer.files[0])};
function canvasBlob(c,type,q){return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('Encoding failed')),type,q))}
async function loadImage(f){const url=URL.createObjectURL(f);try{const img=new Image();img.src=url;await img.decode();return img}finally{URL.revokeObjectURL(url)}}
function draw(img,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);return c}
function download(b,name){if(outputUrl)URL.revokeObjectURL(outputUrl);outputUrl=URL.createObjectURL(b);const a=document.createElement('a');a.href=outputUrl;a.download=name;a.className='btn';a.textContent='Download '+name;show(`<strong>Ready!</strong> ${(b.size/1024).toFixed(1)} KB<br>`);$('result').appendChild(a)}
async function compress(f,target,maxWidth){const img=await loadImage(f);let scale=Math.min(1,maxWidth/img.width),best=null;for(let attempt=0;attempt<12;attempt++){const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));const c=draw(img,w,h);let low=.08,high=.95,fit=null;for(let j=0;j<9;j++){let q=(low+high)/2,b=await canvasBlob(c,'image/jpeg',q);if(b.size<=target){fit=b;low=q}else high=q}if(fit)return fit;const b=await canvasBlob(c,'image/jpeg',.08);if(!best||b.size<best.size)best=b;scale*=.76;if(w<64||h<64)break}return best}
let loadingHEIC=null;
function heicLibrary(){if(loadingHEIC)return loadingHEIC;loadingHEIC=new Promise((res,rej)=>{let s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';s.onload=()=>window.heic2any?res(window.heic2any):rej(Error('HEIC library unavailable'));s.onerror=()=>rej(Error('Could not load HEIC converter; check internet access'));document.head.appendChild(s)});return loadingHEIC}
$('run').onclick=async()=>{const b=$('run');b.disabled=true;b.textContent='Working…';try{
if(mode==='ratio'){const w=numeric('width'),h=numeric('height'),d=gcd(Math.round(w),Math.round(h));let extra='';if($('newwidth').value){let nw=numeric('newwidth');extra=`<br>At width ${nw}: height <strong>${Math.round(nw*h/w)}</strong>`}show(`Aspect ratio: <strong>${Math.round(w/d)}:${Math.round(h/d)}</strong>${extra}`);return}
if(!file)throw Error('Choose an image first.');
let out,name=file.name.replace(/\.[^.]+$/,'');
if(mode==='heic'){if(!/\.hei[cf]$/i.test(file.name)&&!/heic|heif/.test(file.type))throw Error('Please select a HEIC/HEIF file.');const lib=await heicLibrary();out=await lib({blob:file,toType:'image/jpeg',quality:.92});if(Array.isArray(out))out=out[0];name+='.jpg'}
else if(mode==='webp'){if(!/\.webp$/i.test(file.name)&&file.type!=='image/webp')throw Error('Please select a WebP image.');const img=await loadImage(file);out=await canvasBlob(draw(img,img.width,img.height),'image/png');name+='.png'}
else if(mode==='resize'){const img=await loadImage(file);let w=Math.round(numeric('width')),h=Math.round(numeric('height'));if($('lock').checked)h=Math.max(1,Math.round(w*img.height/img.width));if(w*h>40e6)throw Error('Image dimensions too large.');let t=$('format').value;out=await canvasBlob(draw(img,w,h),t,.92);name+='-resized.'+({ 'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[t])}
else{let target=mode==='discord'?numeric('mb')*1024*1024:numeric('kb')*1024;out=await compress(file,target,Math.round(numeric('maxwidth')));name+='-compressed.jpg';if(out.size>target)show('Target size cannot be reached at the current settings.')}
download(out,name);
}catch(e){fail(e.message||String(e))}finally{b.disabled=false;b.textContent=mode==='ratio'?'Calculate':'Process image'}};
if(mode==='resize'){let w=$('width'),h=$('height');w.addEventListener('input',()=>{if(file&&$('lock').checked){loadImage(file).then(img=>{h.value=Math.round(Number(w.value)*img.height/img.width)}).catch(()=>{})}})}