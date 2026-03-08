'use client'

import { useState } from 'react'
import { ChatEvidence } from '@/lib/types'

interface ChatEvidencePanelProps {
  message: ChatEvidence | null
}

function typeIcon(type: string) {
  switch (type) {
    case 'audio': return '\u{1F3A4}'
    case 'image': return '\u{1F4F7}'
    case 'video': return '\u{1F3AC}'
    case 'document': return '\u{1F4C4}'
    case 'sticker': return '\u{1F600}'
    case 'contact': return '\u{1F464}'
    case 'location': return '\u{1F4CD}'
    case 'deleted': return '\u{1F6AB}'
    case 'system': return '\u{2699}'
    default: return '\u{1F4AC}'
  }
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    text: 'Texto', audio: 'Audio', image: 'Imagen', video: 'Video',
    document: 'Documento', sticker: 'Sticker', contact: 'Contacto',
    location: 'Ubicacion', deleted: 'Eliminado', system: 'Sistema',
  }
  return labels[type] || type
}

export default function ChatEvidencePanel({ message }: ChatEvidencePanelProps) {
  const [lightbox, setLightbox] = useState(false)
  if (!message) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-400 p-8">
        <span className="text-5xl mb-4">&#128269;</span>
        <p className="text-sm text-center">Selecciona un mensaje para ver los detalles de la evidencia</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="rounded bg-green-800 px-2 py-1 font-mono text-sm font-bold text-white">
            {message.evidence_id}
          </span>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl">{typeIcon(message.message_type)}</span>
            <span className="text-sm font-medium text-gray-700">{typeLabel(message.message_type)}</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          {message.is_key_evidence && (
            <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
              Prueba clave
            </span>
          )}
          {message.is_weak_point && (
            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
              Punto debil
            </span>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-400 mb-0.5">Fecha</p>
          <p className="text-sm font-medium text-gray-800">
            {new Date(message.message_date).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(message.message_date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-400 mb-0.5">Remitente</p>
          <p className="text-sm font-medium text-gray-800">{message.sender}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-400 mb-0.5">Capitulo</p>
          <p className="text-sm font-medium text-gray-800">{message.chapter} - {message.chapter_name}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-400 mb-0.5">Orden</p>
          <p className="text-sm font-medium text-gray-800">#{message.sort_order}</p>
        </div>
      </div>

      {/* Message text */}
      {message.message_text && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Mensaje</p>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.message_text}</p>
          </div>
        </div>
      )}

      {/* Transcription */}
      {message.transcription && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Transcripcion</p>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm italic text-gray-600 whitespace-pre-wrap">{message.transcription}</p>
          </div>
        </div>
      )}

      {/* Audio player */}
      {message.message_type === 'audio' && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Reproductor</p>
          {message.file_url ? (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <audio controls preload="metadata" className="w-full">
                <source src={message.file_url} type="audio/ogg; codecs=opus" />
              </audio>
              <p className="mt-2 text-xs text-gray-400">{message.file_name || 'audio.opus'}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-center text-sm text-gray-400">
              Sin archivo de audio disponible
            </div>
          )}
        </div>
      )}

      {/* Image preview */}
      {message.message_type === 'image' && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Imagen</p>
          {message.file_url ? (
            <>
              <div
                className="overflow-hidden rounded-xl border border-gray-200 cursor-pointer hover:ring-2 hover:ring-green-400 transition-all"
                onClick={() => setLightbox(true)}
              >
                <img
                  src={message.file_url}
                  alt={message.file_name || 'Imagen'}
                  className="w-full object-contain max-h-[400px]"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">{message.file_name}</p>

              {/* Lightbox */}
              {lightbox && (
                <div
                  className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
                  onClick={() => setLightbox(false)}
                >
                  <button
                    className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white text-xl hover:bg-white/40"
                    onClick={() => setLightbox(false)}
                  >
                    ✕
                  </button>
                  <img
                    src={message.file_url}
                    alt={message.file_name || 'Imagen'}
                    className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400">
              <span className="text-4xl">🖼️</span>
              <p className="mt-1 text-xs">{message.file_name || 'Sin archivo'}</p>
            </div>
          )}
        </div>
      )}

      {/* Video preview */}
      {message.message_type === 'video' && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Video</p>
          {message.file_url ? (
            <>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <video
                  src={message.file_url}
                  controls
                  preload="metadata"
                  className="w-full max-h-[400px]"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">{message.file_name}</p>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400">
              <span className="text-4xl">🎬</span>
              <p className="mt-1 text-xs">{message.file_name || 'Sin archivo'}</p>
            </div>
          )}
        </div>
      )}

      {/* Weak point note */}
      {message.is_weak_point && message.weak_point_note && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-red-400">Nota punto debil</p>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{message.weak_point_note}</p>
          </div>
        </div>
      )}

      {/* Notes */}
      {message.notes && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Notas</p>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-700">{message.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}
