import * as React from "react"
import { ChevronDown } from "lucide-react"

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: readonly string[] | SelectOption[]
  className?: string
  placeholder?: string
}

export function Select({ value, onChange, options, className, placeholder }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 0 })
  const btnRef = React.useRef<HTMLButtonElement>(null)

  const resolved = options.map(o => typeof o === "string" ? { value: o, label: o } : o)
  const selected = resolved.find(o => o.value === value)
  const displayLabel = selected?.label || placeholder || "Select..."

  React.useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        const dropdown = document.getElementById("dp-select-dropdown")
        if (dropdown && !dropdown.contains(e.target as Node)) setOpen(false)
        if (!dropdown) setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick, true)
    return () => document.removeEventListener("mousedown", handleClick, true)
  }, [open])

  function toggle() {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    setOpen(!open)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className={className}
        style={{
          background: "var(--surface-base)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md, 6px)",
          padding: "0.5rem 0.75rem",
          color: selected ? "var(--text-primary)" : "var(--text-muted)",
          fontSize: "0.8125rem",
          fontFamily: "var(--font-sans)",
          height: 36,
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          textAlign: "left",
          cursor: "pointer",
          outline: "none",
          boxSizing: "border-box",
          lineHeight: 1.5,
          transition: "border-color 0.12s ease, box-shadow 0.12s ease",
        }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget.style.borderColor = "var(--border-focus)") }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget.style.borderColor = "var(--border-default)") }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--border-focus)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(61, 118, 109, 0.08)" }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.boxShadow = "none" }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayLabel}
        </span>
        <ChevronDown size={16} style={{ flexShrink: 0, color: "var(--text-muted)" }} />
      </button>
      {open && (
        <div
          id="dp-select-dropdown"
          className="fixed z-[9999] rounded-lg border border-default shadow-xl overflow-hidden"
          style={{
            top: pos.top,
            left: pos.left,
            width: Math.max(pos.width, 160),
            background: "var(--surface-base)",
            opacity: 1,
          }}
        >
          {resolved.map((opt) => {
            const isSel = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  display: "block",
          width: undefined,
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.8125rem",
                  fontFamily: "var(--font-sans)",
                  textAlign: "left",
                  border: "none",
                  cursor: "pointer",
                  background: isSel ? "var(--surface-hover)" : "transparent",
                  color: "var(--text-primary)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = "var(--surface-raised)" }}
                onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = "transparent" }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
