'use client'

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

      {/* Audio player placeholder */}
      {message.message_type === 'audio' && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Reproductor</p>
          <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
              &#9654;
            </button>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full w-0 rounded-full bg-green-500" />
              </div>
              <p className="mt-1 text-xs text-gray-400">{message.file_name || 'audio.opus'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Image/Video placeholder */}
      {(message.message_type === 'image' || message.message_type === 'video') && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {message.message_type === 'image' ? 'Imagen' : 'Video'}
          </p>
          <div className="flex h-48 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400">
            <div className="text-center">
              <span className="text-4xl">{message.message_type === 'image' ? '\u{1F5BC}' : '\u{1F3AC}'}</span>
              <p className="mt-1 text-xs">{message.file_name || 'Sin archivo'}</p>
            </div>
          </div>
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
