"""Low-disk export of the authored camera plan and fixed captions.
The accompanying HyperFrames HTML is the editable motion project. This export
uses the same deterministic sine-eased keyframes, evaluated by FFmpeg without
storing thousands of intermediate screenshots. Real capture pixels are retained.
"""
from pathlib import Path
import subprocess, json, sys
ROOT=Path(__file__).resolve().parent;DEMO=ROOT.parent
plan=json.loads((ROOT/'camera-plan.json').read_text())
keys=plan['keys'];DURATION=plan['duration']
def expression(field):
    result=str(keys[-1][field])
    for a,b in reversed(list(zip(keys,keys[1:]))):
        dt=b['time']-a['time']
        if dt<=0:continue
        value=f"({a[field]}+({b[field]-a[field]})*(1-cos(PI*(on/60-{a['time']})/{dt}))/2)"
        result=f"if(lt(on/60,{b['time']}),{value},{result})"
    return result
zoom=expression('zoom');cx=expression('x');cy=expression('y')
filtergraph=f"[0:v]tpad=stop_mode=clone:stop_duration=0.2,trim=duration={DURATION},setpts=PTS-STARTPTS,fps=60,scale=1210:840:flags=lanczos,pad=1920:840:355:0:color=0x0b0e11,zoompan=z='{zoom}':x='max(0,min(iw-iw/zoom,({cx})-iw/zoom/2))':y='max(0,min(ih-ih/zoom,({cy})-ih/zoom/2))':d=1:s=1920x840:fps=60,pad=1920:1080:0:90:color=0x0b0e11,drawtext=fontfile='C\\:/Windows/Fonts/segoeuib.ttf':text='KineGate':fontsize=34:fontcolor=0xf0b90b:x=40:y=24,drawtext=fontfile='C\\:/Windows/Fonts/consola.ttf':text='Actual recording  |  Synthetic narration  |  Original score  |  No transaction sent':fontsize=18:fontcolor=0xb9bdc6:x=w-tw-40:y=1042,drawtext=fontfile='C\\:/Windows/Fonts/segoeui.ttf':text='│':fontsize=760:fontcolor=0xf0b90b@0.6:x='-50+2020*(t-84.15)/.65':y=90:enable='between(t,84.15,84.8)',ass=polished.ass,fade=t=in:st=0:d=0.25,fade=t=out:st=133.01:d=0.8,setsar=1,format=yuv420p[v]"
(ROOT/'render-filter.txt').write_text(filtergraph,encoding='utf-8')
sample='--sample' in sys.argv
output=ROOT/'kinegate-polished-sample.mp4' if sample else DEMO/'kinegate-demo-polished.mp4'
cmd=['ffmpeg','-hide_banner','-y','-i',str(DEMO/'capture.webm'),'-i',str(ROOT/'project/mix.wav'),'-filter_complex_script','render-filter.txt','-map','[v]','-map','1:a','-t',str(15 if sample else DURATION),'-c:v','libx264','-preset','fast','-crf','18','-threads','4','-r','60','-af','apad=whole_dur=133.81','-c:a','aac','-b:a','192k','-movflags','+faststart',str(output)]
(ROOT/('sample-command.json' if sample else 'render-command.json')).write_text(json.dumps(cmd,indent=2),encoding='utf-8')
with (ROOT/('sample-render.log' if sample else 'final-render.log')).open('w',encoding='utf-8') as log:
    subprocess.run(cmd,cwd=ROOT,stdout=log,stderr=subprocess.STDOUT,check=True)
print(output)
