import { useCallback } from 'react'
import { GridLayout, useContainerWidth, verticalCompactor } from 'react-grid-layout'
import type { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import type { LayoutItem } from '../../types/dashboard'
import { WIDGET_META } from '../../types/dashboard'
import type { DashboardData } from '../../types/dashboardData'
import WidgetWrapper from './WidgetWrapper'

type Props = {
  layout: LayoutItem[]
  data: DashboardData | null
  onLayoutChange: (layout: LayoutItem[]) => void
  onRemove: (id: string) => void
}

export default function DashboardGrid({ layout, data, onLayoutChange, onRemove }: Props) {
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1100 })

  const gridLayout: Layout = layout.map((item) => {
    const meta = WIDGET_META[item.widget_type]
    return {
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      minW: meta.minW ?? 1,
      minH: meta.minH ?? 1,
    }
  })

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      const layoutByI = new Map(layout.map((l) => [l.i, l]))
      const next: LayoutItem[] = newLayout.map((item) => {
        const existing = layoutByI.get(item.i)
        return {
          i: item.i,
          widget_type: existing?.widget_type ?? ('total_revenue' as LayoutItem['widget_type']),
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        }
      })
      onLayoutChange(next)
    },
    [layout, onLayoutChange]
  )

  if (!mounted) {
    return <div ref={containerRef} className="min-h-[400px] w-full" />
  }

  return (
    <div ref={containerRef} className="w-full">
      <GridLayout
        className="layout"
        width={width}
        layout={gridLayout}
        onLayoutChange={handleLayoutChange}
        gridConfig={{
          cols: 12,
          rowHeight: 80,
          margin: [16, 16],
          containerPadding: [0, 0],
          maxRows: Infinity,
        }}
        dragConfig={{ enabled: true, handle: '.widget-drag-handle' }}
        resizeConfig={{ enabled: true }}
        compactor={verticalCompactor}
      >
        {layout.map((item) => (
          <div
            key={item.i}
            className="widget-drag-handle flex min-h-0 min-w-0 flex-col overflow-hidden cursor-grab active:cursor-grabbing"
          >
            <WidgetWrapper
              id={item.i}
              widgetType={item.widget_type}
              data={data}
              onRemove={onRemove}
            />
          </div>
        ))}
      </GridLayout>
    </div>
  )
}
