import sounddevice
import pyloudnorm

fs = 44100
duration = 1  # seconds
data = sounddevice.rec(int(duration * fs), samplerate=fs, channels=1)
sounddevice.wait()
rate = 44100
meter = pyloudnorm.Meter(rate) # create BS.1770 meter
loudness = meter.integrated_loudness(data)

output = int(loudness + 100)
if output < 68:
    print(output)
else:
    print(output + 9)
    
exit()