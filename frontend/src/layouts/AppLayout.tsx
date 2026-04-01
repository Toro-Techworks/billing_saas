import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import TopNav from '../components/layout/TopNav'
import { ToastProvider } from '../components/ui/Toast'

export default function AppLayout() {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TopNav />
          <main className="min-h-0 flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
