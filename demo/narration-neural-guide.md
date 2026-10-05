# Natural neural narration assets

The main voice is the preset `en-US-AndrewNeural`, described by the service's normal voice listing as conversational, warm and confident. `en-US-JennyNeural` is included as a short audition alternative. These are synthetic preset voices, not clones of a teammate or judge. The opening narration explicitly says so.

The short script is in `demo/narration-neural.json`. It follows the actual existing product footage while leaving pauses for the viewer to inspect it. It is not a word-for-word reading of the original captions. Nothing described as FIXTURE, REPLAY or failed off-chain simulation is called a settled trade. The human-authored DevEx requirement is acknowledged without generating that report.

Files:

- `demo/voice-sample-andrew.mp3` / `demo/voice-sample-jenny.mp3`: opening voice auditions for human listening.
- `demo/kinegate-narration-neural.wav`: independent voice track, 48 kHz, stereo PCM, normalized before background music.
- `demo/kinegate-narration-neural.m4a`: independent AAC voice track, 192 kbps.
- `demo/narration-neural-timing.json`: planned scene start/end, measured raw speech duration, tempo adjustment and actual speech end per cue.

Speech is aligned to the existing MP4's 133.68 seconds. The independent track is padded to exactly 133.81 seconds for the new edit's capture cue end; it should not speed the whole narration to fit. Music, dialogue ducking, click sounds, transitions and camera movement are produced in the main edit workflow separately.

## Reproduce

From the project root, with Python 3.12 and ffmpeg/ffprobe in PATH:

```powershell
python -m pip install --target work/tts-packages edge-tts==7.2.8
python scripts/narrate-neural.py --samples
python scripts/narrate-neural.py
```

The tested host used the bundled Python executable from Codex's dependency runtime. Substitute that executable if the system Python is older. An alternate full preset can be generated with `--voice en-US-JennyNeural`. All downloaded libraries and intermediate cue MP3/WAVs live in `work/`; no SDK source is patched. Each synthesis request has a 45-second limit and failures surface directly. There is no paid API key, login, account or spending. Only the public product narration text is sent to the online service.

This uses [edge-tts's documented public Python API](https://github.com/rany2/edge-tts), which accesses the online Edge Read Aloud service. It is a community library, not an official Microsoft SDK or guaranteed service SLA. [Microsoft documents natural voices in Edge Read Aloud](https://support.microsoft.com/en-us/edge/use-immersive-reader-in-microsoft-edge). Successful current synthesis is recorded by actual local files; future availability is not promised. No restriction, TLS validation, authentication, regional control or payment is bypassed.

Desktop SAPI/Zira assets are a technical fallback reference, not the selected final voice. They are identified separately so voice quality can be reviewed honestly. Audio stream verification and nonzero volume are objective checks; subjective naturalness requires playback. The agent environment does not support direct audio input, so do not report a human audition as completed without an actual listener.
