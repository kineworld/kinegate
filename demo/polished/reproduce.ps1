param([string]$Python = 'python')
$ErrorActionPreference='Stop'
Set-Location -LiteralPath $PSScriptRoot
& $Python synthesize_music.py
if($LASTEXITCODE -ne 0){throw 'Music synthesis failed'}
ffmpeg -hide_banner -loglevel warning -y -i ../kinegate-narration-neural.wav -i kinegate-original-score.wav -filter_complex '[0:a]loudnorm=I=-16:TP=-2:LRA=7,aresample=48000,asplit=2[side][vo];[1:a]loudnorm=I=-23:TP=-6:LRA=7,aresample=48000[music];[music][side]sidechaincompress=threshold=0.025:ratio=5:attack=80:release=700:makeup=1.5,asplit=2[duck][save];[vo][duck]amix=inputs=2:normalize=0,alimiter=limit=0.89:level=false,apad=whole_dur=133.81[mix]' -map '[mix]' -t 133.81 -ar 48000 -c:a pcm_s16le project/mix.wav -map '[save]' -t 133.81 -ar 48000 -c:a pcm_s16le kinegate-ducked-score.wav
if($LASTEXITCODE -ne 0){throw 'Audio mixing failed'}
& $Python build_project.py
if($LASTEXITCODE -ne 0){throw 'Project generation failed'}
& $Python render_stream.py
if($LASTEXITCODE -ne 0){throw 'Streaming export failed'}
Write-Output 'Export complete: ../kinegate-demo-polished.mp4'
