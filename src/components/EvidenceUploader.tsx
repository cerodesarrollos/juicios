'use client'

import { useState, useRef } from 'react'

interface Props {
  caseSlug: string
  caseId: string
  proofId: string
  slot: string
  transactionId: string
  onUploaded: () => void
}

export default function EvidenceUploader({ caseSlug, caseId, proofId, slot, transactionId, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('case_slug', caseSlug)
      formData.append('case_id', caseId)
      formData.append('proof_id', proofId)
      formData.append('slot', slot)
      formData.append('transaction_id', transactionId)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) onUploaded()
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-[14px] border-2 border-dashed p-3 text-center transition-colors ${
        dragOver
          ? 'border-white/20 bg-white/[0.04]'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
      }`}
    >
      <input ref={inputRef} type="file" className="hidden" onChange={handleFileSelect} />
      {uploading ? (
        <p className="text-[11px] text-white/30">Subiendo...</p>
      ) : (
        <p className="text-[11px] text-white/20">Arrastra o click para subir</p>
      )}
    </div>
  )
}
