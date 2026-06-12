"use client"

import { useEffect, useRef } from "react"
import { AlertTriangle, X } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "default"
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Delete", cancelLabel = "Cancel", variant = "danger", onConfirm, onCancel }: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) confirmRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={onCancel}
      style={{ background: "rgba(31,35,40,0.35)" }}>
      <div className="rounded-xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--surface-base)", border: "1px solid var(--border-default)" }}>
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{
            background: variant === "danger" ? "var(--color-error-bg)" : "var(--color-info-bg)"
          }}>
            <AlertTriangle className="h-5 w-5" style={{
              color: variant === "danger" ? "var(--color-error)" : "var(--color-info)"
            }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
              <button onClick={onCancel} className="h-6 w-6 flex items-center justify-center rounded shrink-0"
                style={{ color: "var(--text-muted)" }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>{message}</p>
            <div className="flex gap-2 mt-5">
              <button onClick={onCancel} className="btn btn-secondary flex-1 justify-center text-sm h-9">
                {cancelLabel}
              </button>
              <button ref={confirmRef} onClick={onConfirm} className="btn flex-1 justify-center text-sm h-9"
                style={{
                  background: variant === "danger" ? "var(--color-error)" : "#3d766d",
                  color: "#fff"
                }}>
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
