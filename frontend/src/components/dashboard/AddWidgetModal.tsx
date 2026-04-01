import { useMemo } from 'react'
import Modal from '../ui/Modal'
import { WIDGET_META, type WidgetType } from '../../types/dashboard'

const CATEGORY_LABELS: Record<string, string> = {
  kpi: 'KPI',
  chart: 'Charts',
  table: 'Tables',
  alert: 'Alerts',
}

type Props = {
  isOpen: boolean
  onClose: () => void
  existingTypes: WidgetType[]
  onAdd: (widgetType: WidgetType) => void
}

export default function AddWidgetModal({ isOpen, onClose, existingTypes, onAdd }: Props) {
  const available = useMemo(() => {
    const entries = (Object.entries(WIDGET_META) as [WidgetType, typeof WIDGET_META[WidgetType]][])
    return entries.filter(([type]) => !existingTypes.includes(type))
  }, [existingTypes])

  const byCategory = useMemo(() => {
    const map: Record<string, [WidgetType, string][]> = {}
    available.forEach(([type, meta]) => {
      const cat = meta.category
      if (!map[cat]) map[cat] = []
      map[cat].push([type, meta.label])
    })
    return map
  }, [available])

  const handleSelect = (type: WidgetType) => {
    onAdd(type)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add widget" size="lg">
      <div className="space-y-4">
        {available.length === 0 ? (
          <p className="text-center text-slate-500">All widgets are already on your dashboard.</p>
        ) : (
          Object.entries(byCategory).map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {CATEGORY_LABELS[category] ?? category}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {items.map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSelect(type)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  )
}
