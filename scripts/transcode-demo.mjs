import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const dir=resolve(import.meta.dirname,'../demo'),record=JSON.parse(await readFile(resolve(dir,'recording.json'),'utf8'));
const stamp=n=>{const cent=Math.round(n*100);return Math.floor(cent/360000)+':'+String(Math.floor(cent/6000)%60).padStart(2,'0')+':'+String(Math.floor(cent/100)%60).padStart(2,'0')+'.'+String(cent%100).padStart(2,'0');};
const ass='[Script Info]\nScriptType: v4.00+\nPlayResX: 1440\nPlayResY: 1000\nWrapStyle: 0\n\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\nStyle: Default,Arial,24,&H00FFFFFF,&H00FFFFFF,&H00110E0B,&H00110E0B,0,0,0,0,100,100,0,0,3,1,0,2,40,40,18,1\n\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n'+record.cues.map(c=>`Dialogue: 0,${stamp(c.start)},${stamp(c.end)},Default,,0,0,0,,${c.text.replace(/[{}]/g,'').replace(/(.{1,105})(?:\s|$)/g,'$1\\N').replace(/\\N$/,'')}`).join('\n');
await writeFile(resolve(dir,'demo.ass'),ass);
const r=spawnSync('ffmpeg',['-y','-i','capture.webm','-vf',"ass=demo.ass,drawtext=text='NO SIGNING OR BROADCAST | CHECK MODE LABELS':x=w-tw-20:y=12:fontsize=18:fontcolor=0xf0b90b:box=1:boxcolor=0x0b0e11@0.95:boxborderw=6",'-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart','kinegate-demo.mp4'],{cwd:dir,encoding:'utf8'});
if(r.status!==0){console.error(r.stderr.slice(-1800));process.exit(1);}
const probe=spawnSync('ffprobe',['-v','error','-show_entries','format=duration,size','-show_entries','stream=codec_name,width,height,pix_fmt','-of','json','kinegate-demo.mp4'],{cwd:dir,encoding:'utf8'});
if(probe.status!==0)throw new Error('Encoded video inspection failed');
const inspected=JSON.parse(probe.stdout),duration=Number(inspected.format.duration);
if(!Number.isFinite(duration)||duration<=0||duration>240)throw new Error('Video duration outside the four-minute limit');
await writeFile(resolve(dir,'verification.json'),JSON.stringify({verifiedAt:new Date().toISOString(),file:'kinegate-demo.mp4',durationSeconds:duration,sizeBytes:Number(inspected.format.size),streams:inspected.streams,actualBrowserCapture:true,liveTrading:false,provenance:['FIXTURE','SIMULATION','REPLAY of LIVE read-only acquisition'],underFourMinutes:true},null,2));
console.log('PASS captioned actual capture encoded and verified: '+duration+' seconds.');
