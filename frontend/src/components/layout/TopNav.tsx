import { useState, useRef, useEffect } from 'react'
import { HiOutlineMagnifyingGlass, HiOutlineBell, HiOutlineChevronDown } from 'react-icons/hi2'
import { useAuth } from '../../hooks/useAuth'

export default function TopNav() {
  const { logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Notifications"
        >
          <HiOutlineBell className="h-5 w-5" />
        </button>

        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700">
              U
            </div>
            <span className="hidden text-sm font-medium text-slate-700 sm:block">
              User
            </span>
            <HiOutlineChevronDown
              className={`h-4 w-4 text-slate-500 transition ${userMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              <div className="border-b border-slate-100 px-4 py-2 text-sm text-slate-500">
                Signed in as user
              </div>
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false)
                  logout()
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
