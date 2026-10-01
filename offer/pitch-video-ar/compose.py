import subprocess
FF="/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2"
scenes=[["intro",6],["idea",7],["erp",7],["qr",7.5],["portal",7],["ratings",7],["loyalty",7],["smile",7],["dento",6.5],["auto",7],["quality",7],["revenue",8.5],["cta",7.5]]
X=0.6
args=[FF,"-y"]
for id,_ in scenes: args+=["-i",f"clips/{id}.mp4"]
total=sum(d for _,d in scenes)-X*(len(scenes)-1)
args+=["-ss","8","-t",f"{total+0.5:.2f}","-i","../music.wav"]
fc=[]; prev="[0:v]"; off=0.0
for i in range(1,len(scenes)):
    off+=scenes[i-1][1]-X
    out=f"[v{i}]"
    fc.append(f"{prev}[{i}:v]xfade=transition=fade:duration={X}:offset={off:.3f}{out}")
    prev=out
na=len(scenes)
fc.append(f"[{na}:a]atrim=0:{total:.2f},afade=t=in:st=0:d=1.5,afade=t=out:st={total-3.5:.2f}:d=3.5,volume=0.9[a]")
args+=["-filter_complex",";".join(fc),"-map",prev,"-map","[a]","-c:v","libx264","-preset","slow","-crf","20","-pix_fmt","yuv420p","-c:a","aac","-b:a","160k","-movflags","+faststart","Hidento-Pitch-AR.mp4"]
r=subprocess.run(args,capture_output=True,text=True); print(r.returncode, r.stderr[-600:] if r.returncode else "", total)
