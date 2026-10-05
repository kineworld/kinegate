"""Normal edge-tts SDK synthesis of public demo text. No keys, login or security overrides."""
import argparse, asyncio, json, pathlib, shutil, subprocess, sys, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "work" / "tts-packages"))
import edge_tts

DEMO = ROOT / "demo"
WORK = ROOT / "work" / "narration-neural"
WORK.mkdir(parents=True, exist_ok=True)
FFMPEG, FFPROBE = shutil.which("ffmpeg"), shutil.which("ffprobe")
if not FFMPEG or not FFPROBE: raise RuntimeError("ffmpeg and ffprobe are required")

def media(args): subprocess.run([FFMPEG, "-y", "-hide_banner", "-loglevel", "error", *map(str,args)], check=True)
def duration(path): return float(subprocess.check_output([FFPROBE,"-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",str(path)], text=True).strip())

async def speak(text, voice, rate, path):
    # Use the unmodified public SDK. Do not patch TLS, identity, authentication or regional restrictions.
    await asyncio.wait_for(edge_tts.Communicate(text,voice,rate=rate).save(str(path)), timeout=45)

async def main():
    parser=argparse.ArgumentParser();parser.add_argument("--samples",action="store_true");parser.add_argument("--voice");args=parser.parse_args()
    config=json.loads((DEMO/"narration-neural.json").read_text(encoding="utf-8"))
    if args.samples:
        text=config["segments"][0]["text"]+" "+config["segments"][1]["text"]
        for voice in ["en-US-AndrewNeural","en-US-JennyNeural"]:
            path=DEMO/("voice-sample-"+("andrew" if "Andrew" in voice else "jenny")+".mp3")
            await speak(text,voice,"-3%",path);print("Created voice audition",path,flush=True)
        return
    voice=args.voice or config["voice"]
    metrics=[];inputs=[];filters=[];labels=[]
    for i,segment in enumerate(config["segments"]):
        raw=WORK/f"cue-{i+1:02d}.mp3";aligned=WORK/f"cue-{i+1:02d}-aligned.wav"
        cache=WORK/f"cue-{i+1:02d}-request.json"
        request=dict(text=segment["text"],voice=voice,rate=config["rate"])
        if not (raw.exists() and cache.exists() and json.loads(cache.read_text(encoding="utf-8"))==request):
            await speak(segment["text"],voice,config["rate"],raw)
            cache.write_text(json.dumps(request),encoding="utf-8")
        raw_duration=duration(raw);slot=segment["end"]-segment["start"];speed=max(1,raw_duration/(slot-.18))
        if speed>1.18: raise RuntimeError(f"Cue {i+1} needs a shorter script: duration {raw_duration:.2f}s / slot {slot:.2f}s, tempo {speed:.3f}")
        media(["-i",raw,"-af",f"atempo={speed:.6f},apad","-t",f"{slot:.6f}","-ar","48000","-ac","2","-c:a","pcm_s16le",aligned])
        inputs.extend(["-i",str(aligned)]);delay=round(segment["start"]*1000)
        filters.append(f"[{i}:a]adelay={delay}|{delay}[a{i}]");labels.append(f"[a{i}]")
        metrics.append(dict(segment=i+1,**segment,rawDuration=raw_duration,tempo=speed,speechEnd=segment["start"]+raw_duration/speed))
        print(f"Cue {i+1}/16: {raw_duration:.2f}s, tempo {speed:.3f}",flush=True)
    samples=round(133.81*48000)
    filters.append("".join(labels)+f"amix=inputs={len(metrics)}:duration=longest:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad=whole_len={samples},atrim=end_sample={samples}[out]")
    wave=DEMO/"kinegate-narration-neural.wav"
    media([*inputs,"-filter_complex",";".join(filters),"-map","[out]","-ar","48000","-ac","2","-c:a","pcm_s16le",wave])
    media(["-i",wave,"-c:a","aac","-b:a","192k","-metadata","comment="+config["disclosure"],"-metadata:s:a:0","language=eng",DEMO/"kinegate-narration-neural.m4a"])
    report=dict(generatedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),voice=voice,rate=config["rate"],sdkVersion=edge_tts.__version__,duration=duration(wave),method="Unmodified edge-tts; public demo text only; source video untouched",disclosure=config["disclosure"],segments=metrics)
    (DEMO/"narration-neural-timing.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print("Neural narration ready:",wave,flush=True)

if __name__=="__main__": asyncio.run(main())
