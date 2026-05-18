import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import api from '../services/api'
import Breadcrumb from '../components/layout/Breadcrumb'
import PageTitle from '../components/layout/PageTitle'
import Button from '../components/Button'
import { Card, CardContent } from '../components/ui/Card'
import { useToast } from '../components/ui/Toast'

type LocationState = { documentNumber?: string }

export default function InvoicePdfPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { showToast } = useToast()
  const objectUrlRef = useRef<string | null>(null)

  const isQuotationRoute = location.pathname.startsWith('/quotations/')
  const backPath = isQuotationRoute ? '/quotations' : '/invoices'
  const listLabel = isQuotationRoute ? 'Quotations' : 'Invoices'
  const state = location.state as LocationState | null
  const documentNumber = state?.documentNumber

  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const ctrl = new AbortController()

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setPdfUrl(null)
    setLoading(true)

    ;(async () => {
      try {
        const { data, headers } = await api.get<Blob>(`/invoices/${id}/download-pdf`, {
          params: { inline: 1, document_type: isQuotationRoute ? 'quotation' : 'invoice' },
          responseType: 'blob',
          signal: ctrl.signal,
        })
        const ct = headers['content-type'] ?? ''
        if (!ct.includes('application/pdf')) {
          if (!ctrl.signal.aborted) showToast('Could not load PDF preview.')
          return
        }
        const url = URL.createObjectURL(data)
        if (ctrl.signal.aborted) {
          URL.revokeObjectURL(url)
          return
        }
        objectUrlRef.current = url
        setPdfUrl(url)
      } catch {
        if (ctrl.signal.aborted) return
        showToast('Could not load PDF preview.')
      } finally {
        if (!ctrl.signal.aborted) setLoading(false)
      }
    })()

    return () => {
      ctrl.abort()
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [id, showToast])

  const baseFileName = documentNumber
    ? documentNumber.replace(/\s+/g, '-').replace(/\.pdf$/i, '')
    : `document-${id ?? 'export'}`

  const handleDownloadPdf = () => {
    if (!pdfUrl) return
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = `${baseFileName}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: listLabel, to: backPath },
          { label: isQuotationRoute ? 'Quotation PDF' : 'Invoice PDF' },
        ]}
      />
      <PageTitle
        title={isQuotationRoute ? 'Quotation preview' : 'Invoice preview'}
        description="PDF uses your invoice template and layout from Settings."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link to={backPath}>
              <Button variant="secondary">Back to list</Button>
            </Link>
            <Button onClick={handleDownloadPdf} disabled={!pdfUrl || loading}>
              Export PDF
            </Button>
          </div>
        }
      />
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-8 text-center text-slate-500">Generating preview…</p>
          ) : !pdfUrl ? (
            <p className="p-8 text-center text-slate-500">No preview available.</p>
          ) : (
            <iframe
              title={isQuotationRoute ? 'Quotation PDF' : 'Invoice PDF'}
              src={pdfUrl}
              className="h-[min(85vh,900px)] w-full rounded-b-xl border-0 bg-slate-100"
            />
          )}
        </CardContent>
      </Card>
    </>
  )
}
