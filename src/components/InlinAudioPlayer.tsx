'use client'

import { useState, useRef, useEffect, useMemo } from 'react'

interface Props {
  src: string
  transcription?: string | null
  isOutgoing?: boolean
}

function fmt(s: number) {
  if (!s || !isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function generateBars(src: string, count: number): number[] {
  let hash = 0
  for (let i = 0; i < src.length; i++) {
    hash = ((hash << 5) - hash + src.charCodeAt(i)) | 0
  }
  const bars: number[] = []
  for (let i = 0; i < count; i++) {
    hash = ((hash << 5) - hash + i * 7) | 0
    const val = Math.abs(hash % 100)
    bars.push(0.2 + (val / 100) * 0.8)
  }
  return bars
}

export default function InlineAudioPlayer({ src, transcription, isOutgoing = false }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(1)

  const speeds = [1, 1.5, 2, 0.5]
  const BAR_COUNT = 20
  const BAR_HEIGHT = 18
  const bars = useMemo(() => generateBars(src, BAR_COUNT), [src])

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
    if (playing) audio.pause()
    else audio.play()
    setPlaying(!playing)
  }

  function cycleSpeed() {
    const audio = audioRef.current
    if (!audio) return
    const idx = speeds.indexOf(speed)
    const next = speeds[(idx + 1) % speeds.length]
    audio.playbackRate = next
    setSpeed(next)
  }

  const progress = duration > 0 ? currentTime / duration : 0
  const accentColor = isOutgoing ? 'rgb(21 128 61)' : 'rgb(59 130 246)'
  const dimColor = isOutgoing ? 'rgb(187 247 208)' : 'rgb(191 219 254)'

  return (
    <div className="min-w-[200px] max-w-[260px]">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Player row: play button + waveform vertically centered */}
      <div className="flex items-center gap-2.5">
        {/* Play button */}
        <button
          onClick={togglePlay}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: accentColor }}
        >
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 14 14" fill="white">
              <rect x="2" y="1" width="3.5" height="12" rx="1" />
              <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 14 14" fill="white">
              <path d="M3 1.5v11l9-5.5z" />
            </svg>
          )}
        </button>

        {/* Waveform + time row */}
        <div className="flex-1 min-w-0">
          {/* Waveform bars — centered to match play button center */}
          <div
            className="flex items-center gap-[2px] cursor-pointer"
            style={{ height: `${BAR_HEIGHT}px` }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const ratio = (e.clientX - rect.left) / rect.width
              const audio = audioRef.current
              if (audio && duration) {
                audio.currentTime = ratio * duration
                setCurrentTime(ratio * duration)
              }
            }}
          >
            {bars.map((h, i) => {
              const played = i / BAR_COUNT < progress
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full"
                  style={{
                    height: `${Math.round(h * BAR_HEIGHT)}px`,
                    minWidth: '2px',
                    backgroundColor: played ? accentColor : dimColor,
                    transition: 'background-color 0.15s',
                  }}
                />
              )
            })}
          </div>

          {/* Time + speed */}
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[10px] tabular-nums" style={{ color: accentColor }}>
              {playing || currentTime > 0 ? fmt(currentTime) : fmt(duration)}
            </span>
            <button
              onClick={cycleSpeed}
              className="rounded px-1 py-0.5 text-[10px] font-bold"
              style={{ color: accentColor }}
            >
              {speed}×
            </button>
          </div>
        </div>
      </div>

      {/* Transcription — always visible */}
      {transcription && (
        <p className="mt-1.5 text-xs leading-relaxed opacity-70 whitespace-pre-wrap">
          {transcription}
        </p>
      )}
    </div>
  )
}
