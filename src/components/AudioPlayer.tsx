'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  src: string
  transcription?: string | null
}

export default function AudioPlayer({ src, transcription }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(1)

  const speeds = [0.5, 1, 1.5, 2]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => setCurrentTime(audio.currentTime)
    const onMeta = () => setDuration(audio.duration)
    const onEnd = () => setPlaying(false)

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)

    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnd)
    }
  }, [])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
    setPlaying(!playing)
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current
    if (!audio) return
    const time = Number(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }

  function changeSpeed() {
    const audio = audioRef.current
    if (!audio) return
    const idx = speeds.indexOf(speed)
    const next = speeds[(idx + 1) % speeds.length]
    audio.playbackRate = next
    setSpeed(next)
  }

  function fmt(s: number) {
    if (!s || !isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-2">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/[0.08] p-3">
        <button
          onClick={togglePlay}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-white hover:bg-green-600 text-sm"
        >
          {playing ? '⏸' : '▶'}
        </button>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={seek}
          className="flex-1 accent-green-600"
        />
        <span className="text-xs text-white/50 tabular-nums w-20 text-right">
          {fmt(currentTime)} / {fmt(duration)}
        </span>
        <button
          onClick={changeSpeed}
          className="rounded-lg bg-white/[0.08] px-2 py-1 text-xs font-medium text-white/60 hover:bg-white/[0.12]"
        >
          {speed}x
        </button>
      </div>
      {transcription && (
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 text-xs text-white/50">
          <p className="font-medium text-white/60 mb-1">Transcripcion:</p>
          <p className="whitespace-pre-wrap">{transcription}</p>
        </div>
      )}
    </div>
  )
}
