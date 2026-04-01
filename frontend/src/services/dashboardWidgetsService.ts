import api from './api'
import type { DashboardWidgetRecord, LayoutItem } from '../types/dashboard'

export async function getLayout(): Promise<DashboardWidgetRecord[]> {
  const { data } = await api.get<{ data: DashboardWidgetRecord[] }>('/dashboard/widgets')
  return data.data ?? []
}

export function layoutFromRecords(records: DashboardWidgetRecord[]): LayoutItem[] {
  return records.map((r, index) => ({
    i: r.widget_type + '_' + (r.id ?? index),
    widget_type: r.widget_type as LayoutItem['widget_type'],
    x: r.position_x,
    y: r.position_y,
    w: r.width,
    h: r.height,
  }))
}

export function recordsFromLayout(layout: LayoutItem[]): Omit<DashboardWidgetRecord, 'id'>[] {
  return layout.map((item) => ({
    widget_type: item.widget_type,
    position_x: item.x,
    position_y: item.y,
    width: item.w,
    height: item.h,
  }))
}

export async function saveLayout(layout: LayoutItem[]): Promise<DashboardWidgetRecord[]> {
  const payload = recordsFromLayout(layout)
  const { data } = await api.put<{ data: DashboardWidgetRecord[] }>('/dashboard/widgets', {
    widgets: payload,
  })
  return data.data ?? []
}
