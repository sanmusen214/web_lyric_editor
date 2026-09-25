export type WaveformData = {
  peaks: Float32Array
  duration: number
}

/** Decode an uploaded file and retain lightweight peak data for drawing. */
export async function createWaveformData(file: Blob): Promise<WaveformData> {
  const AudioContextClass = window.AudioContext
  if (!AudioContextClass) throw new Error('Web Audio is not supported')

  const context = new AudioContextClass()
  try {
    const source = await file.arrayBuffer()
    // The callback form also works on older iOS Safari releases.
    const buffer = await new Promise<AudioBuffer>((resolve, reject) => {
      context.decodeAudioData(source.slice(0), resolve, reject)
    })
    const bucketCount = Math.max(400, Math.min(240000, Math.ceil(buffer.duration * 80)))
    const peaks = new Float32Array(bucketCount)
    const samplesPerBucket = Math.max(1, Math.ceil(buffer.length / bucketCount))

    for (let channelIndex = 0; channelIndex < buffer.numberOfChannels; channelIndex += 1) {
      const channel = buffer.getChannelData(channelIndex)
      for (let bucket = 0; bucket < bucketCount; bucket += 1) {
        const start = bucket * samplesPerBucket
        const end = Math.min(channel.length, start + samplesPerBucket)
        let peak = 0
        for (let sample = start; sample < end; sample += 1) {
          peak = Math.max(peak, Math.abs(channel[sample]))
        }
        peaks[bucket] = Math.max(peaks[bucket], peak)
      }
    }
    return { peaks, duration: buffer.duration }
  } finally {
    await context.close().catch(() => undefined)
  }
}
