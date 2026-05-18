import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  HiOutlineChartBarSquare,
  HiOutlineUserGroup,
  HiOutlineCube,
  HiOutlineDocumentText,
  HiOutlineDocumentDuplicate,
  HiOutlineBanknotes,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
  HiOutlineBars3,
  HiOutlineChevronLeft,
  HiOutlineTruck,
  HiOutlineShoppingCart,
  HiOutlineCurrencyDollar,
} from 'react-icons/hi2'

const SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBarSquare },
  { to: '/customers', label: 'Customers', icon: HiOutlineUserGroup },
  { to: '/suppliers', label: 'Suppliers', icon: HiOutlineTruck },
  { to: '/products', label: 'Products', icon: HiOutlineCube },
  { to: '/invoices', label: 'Invoices', icon: HiOutlineDocumentText },
  { to: '/quotations', label: 'Quotations', icon: HiOutlineDocumentDuplicate },
  { to: '/purchases', label: 'Purchases', icon: HiOutlineShoppingCart },
  { to: '/payments', label: 'Payments', icon: HiOutlineBanknotes },
  { to: '/expenses', label: 'Expenses', icon: HiOutlineCurrencyDollar },
  { to: '/users', label: 'Users', icon: HiOutlineUsers },
  { to: '/settings', label: 'Settings', icon: HiOutlineCog6Tooth },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
    } catch {
      // ignore
    }
  }, [collapsed])

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      style={{ overflow: 'hidden' }}
    >
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-100 px-3">
        <Link
          to="/dashboard"
          className={`flex min-w-0 flex-1 items-center overflow-hidden ${collapsed ? 'justify-center' : 'gap-3'}`}
          aria-label="Home"
        >
          <img
            src="/toro-logo-green.png"
            alt="Billing"
            className={`object-contain ${collapsed ? 'h-8 w-8' : 'h-9 w-auto'}`}
          />
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <HiOutlineBars3 className="h-5 w-5" />
          ) : (
            <HiOutlineChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
