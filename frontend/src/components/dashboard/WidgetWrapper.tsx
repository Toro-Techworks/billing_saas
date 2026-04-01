import { HiOutlineXMark } from 'react-icons/hi2'
import type { WidgetType } from '../../types/dashboard'
import { WIDGET_META } from '../../types/dashboard'
import type { DashboardData } from '../../types/dashboardData'
import WidgetContent from './widgets/WidgetContent'

type Props = {
  id: string
  widgetType: WidgetType
  data: DashboardData | null
  onRemove: (id: string) => void
}

export default function WidgetWrapper({ id, widgetType, data, onRemove }: Props) {
  const meta = WIDGET_META[widgetType]

  return (
    <div className="group relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="absolute right-2 top-2 z-10 rounded-lg bg-slate-800/80 p-1.5 text-white opacity-0 shadow transition hover:bg-red-600 group-hover:opacity-100"
        aria-label={`Remove ${meta?.label ?? widgetType}`}
      >
        <HiOutlineXMark className="h-4 w-4" />
      </button>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <WidgetContent widgetType={widgetType} data={data} />
      </div>
    </div>
  )
}
