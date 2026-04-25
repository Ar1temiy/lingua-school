import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  GraduationCap,
  ChevronRight,
} from 'lucide-react'
import { useTeacherAuth } from '../../context/TeacherAuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
]

export default function TeacherLayout({ children }) {
  const { teacher, logout } = useTeacherAuth()
  const location = useLocation()

  return (
    <div className="flex h-full" style={{ background: 'var(--color-background)' }}>
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col flex-shrink-0 h-full"
        style={{
          width: '260px',
          background: 'var(--color-surface-container-lowest)',
          borderRight: '1px solid var(--color-surface-container)',
          padding: '1.5rem 1rem',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #394baf 0%, #5365c9 100%)',
            }}
          >
            <GraduationCap size={20} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--color-on-surface)', lineHeight: 1.2 }}>
              Lingua Teacher
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 500 }}>
              Teaching Portal
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-outline)',
              padding: '0 0.75rem',
              marginBottom: '0.5rem',
            }}
          >
            Navigation
          </p>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="nav-icon flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {location.pathname.startsWith(to) && (
                <ChevronRight size={14} style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        {teacher && (
          <div
            className="mt-4 rounded-2xl p-3 flex items-center gap-3"
            style={{ background: 'var(--color-surface-container-low)' }}
          >
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #394baf 0%, #5365c9 100%)',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'white',
              }}
            >
              {teacher.full_name ? teacher.full_name[0].toUpperCase() : 'T'}
            </div>
            <div className="flex-1 min-w-0">
              <p
                style={{
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  color: 'var(--color-on-surface)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {teacher.full_name || teacher.email}
              </p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-outline)', fontWeight: 500 }}>
                Teacher
              </p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-outline)',
                padding: '4px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-outline)')}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        {/* Version */}
        <p
          style={{
            fontSize: '0.6875rem',
            color: 'var(--color-outline)',
            textAlign: 'center',
            marginTop: '0.75rem',
            opacity: 0.7,
          }}
        >
          v1.0.0-stable · Teacher Panel
        </p>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
