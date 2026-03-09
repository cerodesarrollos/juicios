'use client'

import { useState } from 'react'
import { ChatEvidence } from '@/lib/types'

interface ChatEvidencePanelProps {
  message: ChatEvidence | null
}

function typeIcon(type: string) {
  switch (type) {
    case 'audio': return '🎤'; case 'image': return '📷'; case 'video': return '🎬'
    case 'document': return '📄'; case 'sticker': return '😀'; case 'contact': return '👤'
    case 'location': return '📍'; case 'deleted': return '🚫'; case 'system': return '⚙'
    default: return '💬'
  }
}

function typeLabel(type: string) {
  const labels: Record<string, string> = { text:'Texto', audio:'Audio', image:'Imagen', video:'Video', document:'Documento', sticker:'Sticker', contact:'Contacto', location:'Ubicacion', deleted:'Eliminado', system:'Sistema' }
  return labels[type] || type
}

function MetaCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] bg-white/[0.03] border border-white/[0.05] p-3">
      <p className="text-[10px] text-white/20 mb-0.5">{label}</p>
      {children}
    </div>
  )
}

export default function ChatEvidencePanel({ message }: ChatEvidencePanelProps) {
  const [lightbox, setLightbox] = useState(false)
  if (!message) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-white/20 p-8">
        <span className="text-5xl mb-4">🔍</span>
        <p className="text-[13px] text-center">Selecciona un mensaje para ver los detalles</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="rounded-[10px] bg-white/[0.07] border border-white/[0.08] px-2.5 py-1 font-mono text-[13px] font-bold text-white/70">
            {message.evidence_id}
          </span>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl">{typeIcon(message.message_type)}</span>
            <span className="text-[13px] font-medium text-white/55">{typeLabel(message.message_type)}</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          {message.is_key_evidence && <span className="rounded-full bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-white/50">Prueba clave</span>}
          {message.is_weak_point && <span className="rounded-full bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-white/50">Punto debil</span>}
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3">
        <MetaCard label="Fecha">
          <p className="text-[13px] font-medium text-white/70">{new Date(message.message_date).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          <p className="text-[11px] text-white/30">{new Date(message.message_date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
        </MetaCard>
        <MetaCard label="Remitente"><p className="text-[13px] font-medium text-white/70">{message.sender}</p></MetaCard>
        <MetaCard label="Capitulo"><p className="text-[13px] font-medium text-white/70">{message.chapter} - {message.chapter_name}</p></MetaCard>
        <MetaCard label="Orden"><p className="text-[13px] font-medium text-white/70">#{message.sort_order}</p></MetaCard>
      </div>

      {/* Message text */}
      {message.message_text && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/20">Mensaje</p>
          <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[13px] text-white/65 whitespace-pre-wrap">{message.message_text}</p>
          </div>
        </div>
      )}

      {/* Transcription */}
      {message.transcription && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/20">Transcripcion</p>
          <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[13px] italic text-white/45 whitespace-pre-wrap">{message.transcription}</p>
          </div>
        </div>
      )}

      {/* Audio */}
      {message.message_type === 'audio' && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/20">Reproductor</p>
          {message.file_url ? (
            <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4">
              <audio controls preload="metadata" className="w-full"><source src={message.file_url} type="audio/ogg; codecs=opus" /></audio>
              <p className="mt-2 text-[11px] text-white/20">{message.file_name || 'audio.opus'}</p>
            </div>
          ) : (
            <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4 flex items-center justify-center text-[13px] text-white/20">Sin archivo disponible</div>
          )}
        </div>
      )}

      {/* Image */}
      {message.message_type === 'image' && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/20">Imagen</p>
          {message.file_url ? (
            <>
              <div className="overflow-hidden rounded-[14px] border border-white/[0.06] cursor-pointer hover:border-white/[0.12] transition-all" onClick={() => setLightbox(true)}>
                <img src={message.file_url} alt={message.file_name || 'Imagen'} className="w-full object-contain max-h-[400px] opacity-90" />
              </div>
              <p className="mt-1 text-[11px] text-white/20">{message.file_name}</p>
              {lightbox && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(false)}>
                  <button className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white text-xl hover:bg-white/20" onClick={() => setLightbox(false)}>✕</button>
                  <img src={message.file_url} alt={message.file_name || 'Imagen'} className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" onClick={e => e.stopPropagation()} />
                </div>
              )}
            </>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-[14px] border border-white/[0.06] bg-white/[0.02] text-white/20"><span className="text-4xl">🖼️</span></div>
          )}
        </div>
      )}

      {/* Video */}
      {message.message_type === 'video' && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/20">Video</p>
          {message.file_url ? (
            <><div className="overflow-hidden rounded-[14px] border border-white/[0.06]"><video src={message.file_url} controls preload="metadata" className="w-full max-h-[400px]" /></div><p className="mt-1 text-[11px] text-white/20">{message.file_name}</p></>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-[14px] border border-white/[0.06] bg-white/[0.02] text-white/20"><span className="text-4xl">🎬</span></div>
          )}
        </div>
      )}

      {/* Document */}
      {message.message_type === 'document' && message.file_url && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/20">Documento</p>
          <div className="overflow-hidden rounded-[14px] border border-white/[0.06]">
            <iframe src={message.file_url} className="w-full h-[500px]" title={message.file_name || 'Documento'} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] text-white/20">{message.file_name}</p>
            <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-white/40 hover:text-white/60">Abrir ↗</a>
          </div>
        </div>
      )}

      {/* Weak point note */}
      {message.is_weak_point && message.weak_point_note && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/25">Nota punto debil</p>
          <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[13px] text-white/50">{message.weak_point_note}</p>
          </div>
        </div>
      )}

      {/* Notes */}
      {message.notes && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/20">Notas</p>
          <div className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[13px] text-white/50">{message.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}
