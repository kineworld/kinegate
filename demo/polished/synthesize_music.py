"""Original deterministic KineGate score. No samples, network or random noise.
Render with bundled Python + numpy. 48 kHz stereo PCM, 133.68 seconds.
"""
from pathlib import Path
import numpy as np
import wave, json

ROOT = Path(__file__).resolve().parent
SR, DURATION, BPM = 48000, 133.68, 84
n = round(SR * DURATION)
mix = np.zeros((n, 2), dtype=np.float64)
beat = 60 / BPM
chords = [(57,60,64,67), (53,57,60,64), (60,64,67,71), (55,59,62,67)]
def freq(m): return 440 * 2 ** ((m-69)/12)
def add(start, signal, amp=1, pan=0):
    k=round(start*SR)
    if k >= n: return
    signal=signal[:n-k]*amp
    mix[k:k+len(signal),0] += signal*np.sqrt((1-pan)/2)
    mix[k:k+len(signal),1] += signal*np.sqrt((1+pan)/2)
def note(m, length, kind):
    t=np.arange(round(length*SR))/SR
    f=freq(m)
    if kind=='pad':
        s=(np.sin(2*np.pi*f*t)+.22*np.sin(2*np.pi*f*2*t)+.08*np.sin(2*np.pi*f*3*t))
        e=np.minimum(t/.9,1)*np.minimum((length-t)/1.5,1)
        return s*np.clip(e,0,1)*(.96+.04*np.sin(2*np.pi*.17*t))
    if kind=='bell':
        return (np.sin(2*np.pi*f*t)+.17*np.sin(2*np.pi*2*f*t))*np.exp(-t/1.05)*(1-np.exp(-t/.008))
    return (np.sin(2*np.pi*f*t)+.12*np.sin(2*np.pi*2*f*t))*np.exp(-t/1.5)*np.minimum(t/.025,1)
bars=int(np.ceil(DURATION/(beat*4)))
for bar in range(bars):
    start=bar*beat*4
    chord=chords[(bar//2)%4]
    for i,m in enumerate(chord): add(start,note(m,beat*4+.8,'pad'),.036,(-.45,-.15,.15,.45)[i])
    for b in (0,2): add(start+b*beat,note(chord[0]-12,beat*1.9,'bass'),.042)
    # Sparse, deterministic melodic motif and a sine-based soft percussion pulse.
    for j,b in enumerate((.5,1.5,2.5,3.5)):
        if bar%4!=3 or j<2: add(start+b*beat,note(chord[j]+12,1.8,'bell'),.017,(-.4,.25,-.2,.4)[j])
    for b in range(4):
        t=np.arange(round(.19*SR))/SR
        phase=2*np.pi*(52*t+34*.018*(1-np.exp(-t/.018)))
        kick=np.sin(phase)*np.exp(-t/.052)*np.minimum(t/.002,1)
        add(start+b*beat,kick,.037 if b%2==0 else .014)
    if bar%2==1:
        t=np.arange(round(.10*SR))/SR
        tick=(np.sin(2*np.pi*1900*t)+.2*np.sin(2*np.pi*3100*t))*np.exp(-t/.012)*np.minimum(t/.001,1)
        add(start+3*beat,tick,.005,.35)
# A finite stereo echo supplies depth; there is no stochastic texture.
for delay,gain in ((.357,.16),(.714,.08)):
    d=round(SR*delay)
    mix[d:]+=mix[:-d,::-1].copy()*gain
t=np.arange(n)/SR
fade=np.minimum(t/3,1)*np.minimum((DURATION-t)/4,1)
mix*=np.clip(fade,0,1)[:,None]
mix=np.tanh(mix)
pcm=np.int16(np.clip(mix,-1,1)*32767)
out=ROOT/'kinegate-original-score.wav'
with wave.open(str(out),'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
(ROOT/'music-provenance.json').write_text(json.dumps({
 'title':'Evidence Before Action', 'durationSeconds':DURATION,'bpm':BPM,
 'composition':'Original deterministic synthesis authored for KineGate with AI assistance.',
 'sources':'Sine oscillators only; no recorded samples, third-party melodies or random noise.',
 'harmony':'A minor / F major / C major / G major, with sparse diatonic motif.',
 'tools':['Python','numpy','wave'], 'paidServicesUsed':False,
 'attribution':'KineGate — original synthetic ambient score, AI-assisted composition.',
 'licenseNote':'No third-party sampled recording is incorporated. This is a factual provenance statement, not legal clearance of every possible musical similarity.'
},indent=2),encoding='utf-8')
print(out)
