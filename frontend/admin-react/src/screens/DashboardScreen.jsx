import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  RefreshCw,
  Globe,
  ChevronRight,
  Sparkles,
  CalendarDays,
} from 'lucide-react'
import { useStaff } from '../hooks/useStaff'
import { useLessons } from '../hooks/useLessons'

// ── Quick Info Card ──────────────────────────────────────────
function QuickInfoCard({ icon: Icon, label, value, to, delay }) {
  return (
    <Link
      to={to}
      className={`card animate-fade-in-up ${delay}`}
      style={{
        boxShadow: '0 2px 12px rgba(25,28,30,0.06)',
        textDecoration: 'none',
        transition: 'transform 0.2s ease, background-color 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container-low)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface)')}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{ width: '48px', height: '48px', background: 'var(--color-surface-container-high)' }}
        >
          <Icon size={24} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
            {label}
          </p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-on-surface)', lineHeight: 1.2 }}>
            {value}
          </p>
        </div>
        <ChevronRight size={18} style={{ marginLeft: 'auto', color: 'var(--color-outline)', opacity: 0.5 }} />
      </div>
    </Link>
  )
}

export default function DashboardScreen() {
  const { staff, loading: staffLoading, refetch: refetchStaff } = useStaff()
  const { lessons, loading: lessonsLoading, refetch: refetchLessons } = useLessons()

  const teachersCount = useMemo(() => staff.filter((s) => s.role === 'teacher').length, [staff])
  const lessonsToday = useMemo(() => lessons.length, [lessons])

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-10 animate-fade-in">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>
            Welcome back, Admin
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '1rem', marginTop: '0.25rem' }}>
            Here is what's happening at the school today.
          </p>
        </div>
        <button
          className="btn-secondary"
          onClick={() => { refetchStaff(); refetchLessons() }}
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {/* ── High-Level Overview ── */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <QuickInfoCard
          icon={Users}
          label="Total Educators"
          value={staffLoading ? '...' : teachersCount}
          to="/teachers"
          delay="delay-50"
        />
        <QuickInfoCard
          icon={CalendarDays}
          label="Active Lessons"
          value={lessonsLoading ? '...' : lessonsToday}
          to="/lessons"
          delay="delay-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="animate-fade-in-up delay-150">
          <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-on-surface)', marginBottom: '1.25rem' }}>
            Quick Management
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              to="/teachers"
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: 'var(--color-surface-container-low)', textDecoration: 'none' }}
            >
              <div className="flex items-center gap-3">
                <Users size={20} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>Manage Staff</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--color-outline)' }} />
            </Link>
            <Link
              to="/lessons"
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: 'var(--color-surface-container-low)', textDecoration: 'none' }}
            >
              <div className="flex items-center gap-3">
                <CalendarDays size={20} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>Schedule Lessons</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--color-outline)' }} />
            </Link>
            <Link
              to="/languages"
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: 'var(--color-surface-container-low)', textDecoration: 'none' }}
            >
              <div className="flex items-center gap-3">
                <Globe size={20} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>Regional Settings</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--color-outline)' }} />
            </Link>
          </div>
        </div>

        {/* Global Settings Promo */}
        <div className="card animate-fade-in-up delay-200" style={{ background: 'var(--color-primary-container)', border: 'none' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} style={{ color: 'var(--color-on-primary-container)' }} />
            <h2 style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-on-primary-container)' }}>
              School Configuration
            </h2>
          </div>
          <p style={{ color: 'var(--color-on-primary-container)', opacity: 0.8, fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Update global holiday schedules, language availability, and system-wide notifications from the advanced settings panel.
          </p>
          <Link
            to="/settings"
            className="btn-primary"
            style={{ display: 'inline-flex', background: 'var(--color-on-primary-container)', color: 'var(--color-primary-container)' }}
          >
            Open Settings
          </Link>
        </div>
      </div>
    </div>
  )
}
