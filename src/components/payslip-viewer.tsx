"use client"

import { useEffect, useRef } from "react"
import { BlobProvider } from "@react-pdf/renderer"
import { PayslipPDF } from "@/lib/pdf/react-payslip"
import type { PayslipData } from "@/types"

export default function PayslipViewer({ data, onBlobReady }: { data: PayslipData; onBlobReady?: (blob: Blob) => void }) {
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  return (
    <BlobProvider document={<PayslipPDF data={data} />}>
      {({ blob, loading, error }) => {
        const status = loading ? "loading" : error ? "error" : blob ? "ready" : "empty"

        if (status === "loading") return <div className="h-full flex items-center justify-center text-sm text-tertiary">Loading preview...</div>
        if (status === "error") return <div className="h-full flex items-center justify-center text-sm text-red-500">Error: {error!.message}</div>
        if (status === "empty") return <div className="h-full flex items-center justify-center text-sm text-red-500">Failed to load preview</div>

        if (urlRef.current) URL.revokeObjectURL(urlRef.current)
        const url = URL.createObjectURL(blob!)
        urlRef.current = url

        return <BlobDisplay blob={blob!} url={url} onBlobReady={onBlobReady} />
      }}
    </BlobProvider>
  )
}

function BlobDisplay({ blob, url, onBlobReady }: { blob: Blob; url: string; onBlobReady?: (blob: Blob) => void }) {
  useEffect(() => {
    onBlobReady?.(blob)
  }, [blob, onBlobReady])

  return <embed src={url} type="application/pdf" className="w-full h-full" />
}
