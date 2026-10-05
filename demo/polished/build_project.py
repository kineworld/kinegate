from pathlib import Path
import json, math, shutil, html
ROOT=Path(__file__).resolve().parent
DEMO=ROOT.parent
PROJECT=ROOT/'project'
DURATION=133.81
segments=json.loads((DEMO/'narration-neural-timing.json').read_text(encoding='utf-8'))['segments']
titles=['Evidence before action','Know the mode','One exact intention','Bind every reviewed input','Local simulation only','An edit invalidates the receipt','Market clocks matter','Issuer-specific rights','Receipts expire','The same sixteen fixtures','Read-only API evidence','A recorded quote','A failed real simulation','Existence is not settlement','Settlement remains unverified','Inspect it without a wallet']
# Coordinates are editorial focus targets from the real source pixels, not fabricated click logs.
targets=[(720,430,1),(550,430,1.2),(1060,430,1.55),(1070,780,1.6),(1070,760,1.5),(560,390,1.5),(1070,300,1.45),(1060,300,1.5),(1090,280,1.5),(830,320,1.25),(1010,480,1.3),(960,520,1.55),(930,690,1.55),(960,550,1.35),(930,550,1.3),(730,400,1)]
keys=[{'time':0,'x':960,'y':420,'zoom':1}]
for i,s in enumerate(segments):
    x,y,z=targets[i];x=355.2+.84*x;y=.84*y
    keys.extend([{'time':s['start']+.55,'x':960,'y':420,'zoom':1},
                 {'time':s['start']+2.05,'x':x,'y':y,'zoom':z},
                 {'time':max(s['start']+2.1,s['end']-1.65),'x':x,'y':y,'zoom':z},
                 {'time':s['end']-.25,'x':960,'y':420,'zoom':1}])
keys.append({'time':DURATION,'x':960,'y':420,'zoom':1})
keys.sort(key=lambda k:k['time'])
(ROOT/'camera-plan.json').write_text(json.dumps({'duration':DURATION,'source':'capture.webm','sourceSize':[1440,1000],'stage':[1920,840],'fitScale':.84,'fitX':355.2,'editorialTargetsNotMouseLogs':True,'ease':'sine.inOut','keys':keys},indent=2),encoding='utf-8')
shutil.copyfile(DEMO/'capture.webm',PROJECT/'capture.webm')
shutil.copyfile(PROJECT/'node_modules/gsap/dist/gsap.min.js',PROJECT/'gsap.min.js')
captiondivs=[];timelines=[]
for i,s in enumerate(segments):
    t=s['start'];end=s['end'];mode='FIXTURE · LOCAL SIMULATION' if i<9 else ('FIXTURE · AUTHORED BASELINE' if i==9 else 'REPLAY · READ-ONLY ACQUISITION')
    captiondivs.append(f'<div id="scene-{i}" class="scene" data-layout-allow-overlap style="opacity:{1 if i==0 else 0}"><div class="chapter">{html.escape(titles[i])}</div><div class="mode">{html.escape(mode)}</div><div class="caption">{html.escape(s["text"])}</div></div>')
    if i>0:
        timelines.extend([f'tl.to("#scene-{i-1}",{{opacity:0,duration:.45,ease:"sine.inOut"}},{t-.2});',f'tl.fromTo("#scene-{i}",{{opacity:0}},{{opacity:1,duration:.45,ease:"sine.inOut"}},{t-.2});'])
    timelines.extend([f'tl.from("#scene-{i} .chapter",{{x:18,opacity:0,duration:.4,ease:"power2.out",immediateRender:false}},{t+.1});',f'tl.from("#scene-{i} .mode",{{y:-5,opacity:0,duration:.4,ease:"sine.out",immediateRender:false}},{t+.14});',f'tl.from("#scene-{i} .caption",{{y:7,opacity:0,duration:.35,ease:"power3.out",immediateRender:false}},{t+.18});'])
for a,b in zip(keys,keys[1:]):
    # Transform a wrapper only; source video timing belongs to HyperFrames.
    scale=b['zoom']; x=max(1920*(1-scale),min(0,960-b['x']*scale));y=max(840*(1-scale),min(0,420-b['y']*scale))
    timelines.append(f'tl.to("#camera",{{scale:{scale},x:{x},y:{y},duration:{b["time"]-a["time"]},ease:"sine.inOut"}},{a["time"]});')
timelines.extend(['tl.from("#brand",{opacity:0,x:-16,duration:.6,ease:"power2.out"},.15);','tl.from("#disclosure",{opacity:0,y:8,duration:.6,ease:"sine.out"},.2);','tl.from("#progress",{scaleX:0,duration:133.81,ease:"none"},0);','tl.fromTo("#wipe",{x:-30},{x:1950,duration:.65,ease:"power2.inOut"},84.15);','tl.to("#root",{opacity:0,duration:.8,ease:"sine.inOut"},133.01);'])
doc='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1920,height=1080"><script src="gsap.min.js"></script><style>
@font-face{font-family:"Segoe UI";src:local("Segoe UI")}@font-face{font-family:"Consolas";src:local("Consolas")}*{box-sizing:border-box}body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#0b0e11;color:#eaecef;font-family:"Segoe UI",sans-serif}#root{width:100%;height:100%;position:relative}#stage{position:absolute;left:0;top:90px;width:1920px;height:840px;overflow:hidden;background:#0b0e11;border-top:1px solid #292d34;border-bottom:1px solid #292d34}#camera{width:1920px;height:840px;transform-origin:0 0;position:relative;will-change:transform}video{position:absolute;width:1209.6px;height:840px;left:355.2px;top:0}#brand{position:absolute;left:40px;top:20px;font-size:34px;font-weight:900;color:#f0b90b}#disclosure{position:absolute;right:40px;bottom:14px;font-family:"Consolas",monospace;font-size:18px;color:#b9bdc6}.scene{position:absolute;inset:0;pointer-events:none}.chapter{position:absolute;left:300px;top:27px;font-size:28px;font-weight:500;color:#eaecef}.mode{position:absolute;right:40px;top:32px;font:22px "Consolas",monospace;color:#f0b90b}.caption{position:absolute;left:180px;right:180px;top:946px;font-size:30px;line-height:1.28;text-align:center;max-height:84px;color:#eaecef}#progress{position:absolute;bottom:0;left:0;width:1920px;height:4px;background:#f0b90b;transform-origin:0 0}#wipe{position:absolute;left:0;top:0;width:8px;height:840px;background:#f0b90b;opacity:.65;transform:translateX(-30px)}
</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="133.81" data-width="1920" data-height="1080" data-fps="60"><div id="stage"><div id="camera" data-layout-allow-overflow><video id="source" data-start="0" data-duration="133.81" data-track-index="0" src="capture.webm" muted playsinline></video></div><div id="wipe" data-layout-ignore></div></div><div id="brand">KineGate</div>'''+''.join(captiondivs)+'''<div id="disclosure">Actual product recording · Synthetic narration · Original score · No transaction sent</div><div id="progress" data-layout-ignore></div><audio id="mix" src="mix.wav" data-start="0" data-duration="133.81" data-track-index="2" data-volume="1"></audio></div><script>window.__timelines=window.__timelines||{};const tl=gsap.timeline({paused:true});'''+''.join(timelines)+'''window.__timelines.main=tl;</script></body></html>'''
(PROJECT/'index.html').write_text(doc,encoding='utf-8')
# Fixed subtitles with short phrase groups; these are actual spoken words.
def ass_time(t):
    c=round(t*100);return f'{c//360000}:{c//6000%60:02}:{c//100%60:02}.{c%100:02}'
ass='''[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\nWrapStyle: 0\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Caption,Segoe UI,32,&H00EFECEA,&H000000FF,&H00201A18,&HCC11100B,0,0,0,0,100,100,0,0,1,2,0,2,150,150,57,1\nStyle: Chapter,Segoe UI,28,&H00EFECEA,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,300,50,28,1\nStyle: Mode,Consolas,22,&H000BB9F0,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,9,50,40,34,1\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n'''
for i,s in enumerate(segments):
    mode='FIXTURE / LOCAL SIMULATION' if i<9 else ('FIXTURE / AUTHORED BASELINE' if i==9 else 'REPLAY / READ-ONLY ACQUISITION')
    ass+=f'Dialogue: 1,{ass_time(s["start"])},{ass_time(s["end"])},Chapter,,0,0,0,,{{\\fad(220,220)}}{titles[i]}\n'
    ass+=f'Dialogue: 1,{ass_time(s["start"])},{ass_time(s["end"])},Mode,,0,0,0,,{{\\fad(220,220)}}{mode}\n'
    words=s['text'].split();groups=[];current=[]
    for w in words:
        current.append(w)
        if len(' '.join(current))>86 or (w.endswith(('.','?','!')) and len(current)>=6):groups.append(' '.join(current));current=[]
    if current:groups.append(' '.join(current))
    lengths=[len(g.split()) for g in groups];available=s['speechEnd']-s['start'];cursor=s['start']
    for g,l in zip(groups,lengths):
        end=cursor+available*l/sum(lengths)
        ass+=f'Dialogue: 2,{ass_time(cursor)},{ass_time(end)},Caption,,0,0,0,,{{\\fad(100,100)}}{g}\n';cursor=end
(ROOT/'polished.ass').write_text(ass,encoding='utf-8-sig')
print('Project, camera plan and fixed captions generated.')
