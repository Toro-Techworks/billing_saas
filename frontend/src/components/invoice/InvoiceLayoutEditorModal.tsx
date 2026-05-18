import { useCallback, useEffect, useState } from 'react'
import { GridLayout, noCompactor, useContainerWidth } from 'react-grid-layout'
import type { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import Button from '../Button'
import Modal from '../ui/Modal'
import { useToast } from '../ui/Toast'
import {
  invoiceLayoutService,
  INVOICE_LAYOUT_COMPONENTS,
  type InvoiceLayoutItem,
  type InvoiceLayoutJson,
} from '../../services/invoiceLayoutService'
import InvoicePreviewFromLayout from './InvoicePreviewFromLayout'

const COMPONENT_LABELS: Record<string, string> = Object.fromEntries(
  INVOICE_LAYOUT_COMPONENTS.map((c) => [c.id, c.label])
)

type Props = {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
}

export default function InvoiceLayoutEditorModal({ isOpen, onClose, onSaved }: Props) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [layoutItems, setLayoutItems] = useState<InvoiceLayoutItem[]>([])
  const A4_WIDTH = 595
  const A4_HEIGHT = 842
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: A4_WIDTH })

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    invoiceLayoutService
      .get()
      .then((res) => {
        const layout = (res.layout_json?.layout ?? []) as InvoiceLayoutItem[]
        if (layout.length === 0) {
          setLayoutItems(getDefaultLayout())
        } else {
          setLayoutItems(layout.map((item) => ({ ...item, visible: item.visible !== false })))
        }
      })
      .catch(() => {
        showToast('Failed to load layout.')
        setLayoutItems(getDefaultLayout())
      })
      .finally(() => setLoading(false))
  }, [isOpen, showToast])

  const gridLayout: Layout = layoutItems.map((item) => ({
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: 1,
    minH: 1,
  }))

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      const byI = new Map(layoutItems.map((l) => [l.i, l]))
      setLayoutItems(
        newLayout.map((item) => {
          const existing = byI.get(item.i)
          return {
            i: item.i,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            visible: existing?.visible !== false,
          }
        })
      )
    },
    [layoutItems]
  )

  const toggleVisible = (i: string) => {
    setLayoutItems((prev) =>
      prev.map((item) => (item.i === i ? { ...item, visible: !item.visible } : item))
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const layoutJson: InvoiceLayoutJson = {
        layout: layoutItems.map(({ i, x, y, w, h, visible }) => ({
          i,
          x,
          y,
          w,
          h,
          visible: visible !== false,
        })),
      }
      await invoiceLayoutService.save(layoutJson)
      showToast('Layout saved.')
      onSaved?.()
      onClose()
    } catch {
      showToast('Failed to save layout.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={() => !saving && onClose()} title="Edit Invoice Layout" size="full">
      {loading ? (
        <p className="py-8 text-center text-slate-500">Loading layout…</p>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex-1 min-h-0">
            <p className="mb-2 text-sm text-slate-600">
              Drag and resize blocks within the A4 page. Use the eye icon to show or hide in the invoice.
            </p>
            <div
              ref={containerRef}
              className="rounded-lg border-2 border-slate-300 bg-slate-50 shadow-inner"
              style={{
                width: A4_WIDTH,
                height: A4_HEIGHT,
                maxHeight: A4_HEIGHT,
                overflow: 'auto',
              }}
            >
              {mounted && (
                <GridLayout
                  className="layout"
                  width={width}
                  layout={gridLayout}
                  onLayoutChange={handleLayoutChange}
                  gridConfig={{
                    cols: 12,
                    rowHeight: 56,
                    margin: [10, 14],
                    containerPadding: [4, 8],
                    maxRows: Infinity,
                  }}
                  dragConfig={{ enabled: true, handle: '.invoice-block-drag-handle' }}
                  resizeConfig={{ enabled: true }}
                  compactor={noCompactor}
                >
                  {layoutItems.map((item) => (
                    <div
                      key={item.i}
                      className="invoice-block-drag-handle flex cursor-grab active:cursor-grabbing items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
                    >
                      <span className="truncate text-sm font-medium text-slate-700">
                        {COMPONENT_LABELS[item.i] ?? item.i}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleVisible(item.i)
                        }}
                        className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        title={item.visible !== false ? 'Hide' : 'Show'}
                      >
                        {item.visible !== false ? (
                          <span className="text-sm">👁</span>
                        ) : (
                          <span className="text-sm opacity-50">👁</span>
                        )}
                      </button>
                    </div>
                  ))}
                </GridLayout>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Layout'}
              </Button>
            </div>
          </div>
          <div className="w-full flex-shrink-0 lg:w-[380px]">
            <div className="sticky top-4">
              <p className="mb-2 text-sm font-medium text-slate-600">Live Preview (A4)</p>
              <div className="mx-auto max-w-[360px]" style={{ aspectRatio: '210/297' }}>
                <InvoicePreviewFromLayout layoutItems={layoutItems} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

function getDefaultLayout(): InvoiceLayoutItem[] {
  return [
    { i: 'logo', x: 0, y: 0, w: 3, h: 1, visible: true },
    { i: 'company_details', x: 0, y: 1, w: 3, h: 1, visible: true },
    { i: 'invoice_header', x: 3, y: 0, w: 3, h: 1, visible: true },
    { i: 'customer_details', x: 0, y: 2, w: 6, h: 2, visible: true },
    { i: 'item_table', x: 0, y: 4, w: 12, h: 3, visible: true },
    { i: 'tax_summary', x: 8, y: 7, w: 4, h: 1, visible: true },
    { i: 'subtotal_total', x: 8, y: 8, w: 4, h: 1, visible: true },
    { i: 'payment_terms', x: 0, y: 9, w: 6, h: 1, visible: true },
    { i: 'notes', x: 0, y: 10, w: 6, h: 1, visible: true },
    { i: 'bank_details', x: 6, y: 9, w: 3, h: 1, visible: true },
    { i: 'signature', x: 9, y: 9, w: 2, h: 1, visible: true },
    { i: 'qr_code', x: 11, y: 9, w: 1, h: 2, visible: false },
  ]
}
