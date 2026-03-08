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

// Generate pseudo-random waveform bars from src hash
function generateBars(src: string, count: number): number[] {
  let hash = 0
  for (let i = 0; i < src.length; i++) {
    hash = ((hash << 5) - hash + src.charCodeAt(i)) | 0
  }
  const bars: number[] = []
  for (let i = 0; i < count; i++) {
    hash = ((hash << 5) - hash + i * 7) | 0
    const val = Math.abs(hash % 100)
    bars.push(0.15 + (val / 100) * 0.85) // min 15%, max 100%
  }
  return bars
}

export default function InlineAudioPlayer({ src, transcription, isOutgoing = false }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [showTranscription, setShowTranscription] = useState(false)

  const speeds = [1, 1.5, 2, 0.5]
  const BAR_COUNT = 28
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

  function seekFromBar(barIndex: number) {
    const audio = audioRef.current
    if (!audio || !duration) return
    const time = (barIndex / BAR_COUNT) * duration
    audio.currentTime = time
    setCurrentTime(time)
  }

  const progress = duration > 0 ? currentTime / duration : 0

  const accentColor = isOutgoing ? 'rgb(21 128 61)' : 'rgb(59 130 246)' // green-700 / blue-500
  const dimColor = isOutgoing ? 'rgb(187 247 208)' : 'rgb(191 219 254)' // green-200 / blue-200
  const bgHover = isOutgoing ? 'hover:bg-green-200/50' : 'hover:bg-blue-200/50'

  return (
    <div className="min-w-[220px] max-w-[280px]">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Main player row */}
      <div className="flex items-center gap-2">
        {/* Play button */}
        <button
          onClick={togglePlay}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: accentColor }}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <rect x="2" y="1" width="3.5" height="12" rx="1" />
              <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <path d="M3 1.5v11l9-5.5z" />
            </svg>
          )}
        </button>

        {/* Waveform + time */}
        <div className="flex-1 min-w-0">
          {/* Waveform bars */}
          <div
            className="flex items-end gap-[2px] h-[28px] cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const ratio = x / rect.width
              const idx = Math.floor(ratio * BAR_COUNT)
              seekFromBar(Math.max(0, Math.min(BAR_COUNT - 1, idx)))
            }}
          >
            {bars.map((h, i) => {
              const played = i / BAR_COUNT < progress
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-colors duration-100"
                  style={{
                    height: `${h * 28}px`,
                    minWidth: '2px',
                    backgroundColor: played ? accentColor : dimColor,
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
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors ${bgHover}`}
              style={{ color: accentColor }}
            >
              {speed}×
            </button>
          </div>
        </div>
      </div>

      {/* Transcription toggle */}
      {transcription && (
        <div className="mt-1.5">
          <button
            onClick={() => setShowTranscription(!showTranscription)}
            className="flex items-center gap-1 text-[10px] font-medium transition-colors"
            style={{ color: accentColor }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="currentColor"
              className={`transition-transform ${showTranscription ? 'rotate-90' : ''}`}
            >
              <path d="M3 1l5 4-5 4z" />
            </svg>
            Transcripción
          </button>
          {showTranscription && (
            <p className="mt-1 text-xs leading-relaxed opacity-75 whitespace-pre-wrap">
              {transcription}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
