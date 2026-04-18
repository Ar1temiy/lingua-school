import { useMemo } from 'react'
import {
  DollarSign,
  UserPlus,
  CalendarCheck,
  Star,
  Users,
  RefreshCw,
  Globe,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useStaff } from '../hooks/useStaff'
import { useLessons } from '../hooks/useLessons'
import { format, parseISO } from 'date-fns'

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, colorClass, delay }) {
  return (
    <div
      className={`card animate-fade-in-up ${delay}`}
      style={{ boxShadow: '0 2px 12px rgba(25,28,30,0.06)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{ width: '44px', height: '44px', background: 'var(--color-surface-container-low)' }}
        >
          <Icon size={20} style={{ color: 'var(--color-primary)' }} />
        </div>
        {sub && (
          <span className="chip chip-success" style={{ fontSize: '0.6875rem' }}>
            {sub}
          </span>
        )}
      </div>
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '0.25rem' }}>
        {label}
      </p>
      <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-on-surface)', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </p>
    </div>
  )
}

// ── Teacher Row ───────────────────────────────────────────────
function TeacherRow({ teacher, index }) {
  const languages = teacher.languages?.map((l) => l.name).join(', ') || '—'
  const initials = teacher.full_name
    ? teacher.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??'
  const roleLabels = { teacher: 'Educator', admin: 'Administrator' }

  const avatarColors = ['#394baf', '#5365c9', '#4858ab', '#993100', '#008060']
  const color = avatarColors[index % avatarColors.length]

  return (
    <tr className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
      <td>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: '36px', height: '36px', background: color, fontSize: '0.8125rem', fontWeight: 700, color: 'white' }}
          >
            {initials}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-on-surface)' }}>
              {teacher.full_name}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)' }}>
              {teacher.email}
            </p>
          </div>
        </div>
      </td>
      <td>
        <span className="chip chip-active">{roleLabels[teacher.role] || teacher.role}</span>
      </td>
      <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>
        {languages}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <span className="status-dot status-dot-active" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>Active</span>
        </div>
      </td>
    </tr>
  )
}

// ── Booking Row ───────────────────────────────────────────────
function BookingRow({ lesson, index }) {
  const teacherName = lesson.teacher?.full_name || '—'
  const langName = lesson.language?.name || '—'
  const levelLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    business: 'Business',
    conversational: 'Conversational',
  }
  const level = levelLabels[lesson.level] || lesson.level || '—'

  let dateStr = '—'
  let timeStr = '—'
  if (lesson.scheduled_at) {
    try {
      const dt = parseISO(lesson.scheduled_at)
      dateStr = format(dt, 'MMM d, yyyy')
      timeStr = format(dt, 'HH:mm') + ' GMT'
    } catch {}
  }

  const spotsLeft = lesson.capacity - (lesson.active_bookings_count ?? 0)
  const isFull = spotsLeft <= 0

  return (
    <tr className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
      <td>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-on-surface)' }}>
            {lesson.title}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)' }}>
            {langName} · {level}
          </p>
        </div>
      </td>
      <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', fontWeight: 600 }}>
        {teacherName}
      </td>
      <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>{dateStr}</td>
      <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>{timeStr}</td>
      <td>
        <span className={`chip ${isFull ? 'chip-error' : 'chip-success'}`}>
          {isFull ? 'Full' : `${spotsLeft} left`}
        </span>
      </td>
    </tr>
  )
}

// ── Skeleton Row ─────────────────────────────────────────────
function SkeletonRow({ cols }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <div className="skeleton" style={{ height: '20px', borderRadius: '8px' }} />
        </td>
      ))}
    </tr>
  )
}

// ── Main Dashboard ────────────────────────────────────────────
export default function DashboardScreen() {
  const { staff, loading: staffLoading, refetch: refetchStaff } = useStaff()
  const { lessons, loading: lessonsLoading, refetch: refetchLessons } = useLessons()

  const teachers = useMemo(() => staff.filter((s) => s.role === 'teacher'), [staff])

  const busiestTeacher = useMemo(() => {
    if (!teachers.length) return '—'
    return teachers[0].full_name || '—'
  }, [teachers])

  const activeBookings = useMemo(() => {
    return lessons.reduce((sum, l) => sum + (l.active_bookings_count ?? 0), 0)
  }, [lessons])

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px' }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>
            Admin Control Center
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Full visibility into school operations
          </p>
        </div>
        <button
          className="btn-secondary"
          onClick={() => { refetchStaff(); refetchLessons() }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value="$124,500"
          sub="↑ 12%"
          delay="delay-50"
        />
        <StatCard
          icon={UserPlus}
          label="New Registrations"
          value={staffLoading ? '—' : `+${staff.length}`}
          sub="This month"
          delay="delay-100"
        />
        <StatCard
          icon={CalendarCheck}
          label="Active Bookings"
          value={lessonsLoading ? '—' : activeBookings.toLocaleString()}
          delay="delay-150"
        />
        <StatCard
          icon={Star}
          label="Busiest Teacher"
          value={staffLoading ? '—' : busiestTeacher}
          delay="delay-200"
        />
      </div>

      {/* ── Two-column: Teacher Mgment + Language Control ── */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Teacher Management */}
        <div className="col-span-2 card animate-fade-in-up delay-100" style={{ boxShadow: '0 2px 12px rgba(25,28,30,0.06)' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users size={18} style={{ color: 'var(--color-primary)' }} />
              <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--color-on-surface)' }}>
                Teacher Management
              </h2>
            </div>
            <a
              href="/teachers"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                textDecoration: 'none',
              }}
            >
              View All <ChevronRight size={14} />
            </a>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Role</th>
                <th>Languages</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {staffLoading
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
                : teachers.slice(0, 5).map((t, i) => <TeacherRow key={t.id} teacher={t} index={i} />)}
              {!staffLoading && teachers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-outline)', padding: '2rem' }}>
                    No teachers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Language Control */}
        <div className="card animate-fade-in-up delay-150" style={{ boxShadow: '0 2px 12px rgba(25,28,30,0.06)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Globe size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--color-on-surface)' }}>
              Language Control
            </h2>
          </div>

          <div
            className="card-hero mb-4"
            style={{ borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}
          >
            <div className="flex items-start gap-2 mb-2">
              <Sparkles size={16} color="rgba(255,255,255,0.7)" />
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                School Settings
              </p>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
              Manage regional availability and holiday schedules.
            </p>
            <a
              href="/settings"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '0.75rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.15)',
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
              }}
            >
              Configure <ChevronRight size={13} />
            </a>
          </div>

          <a
            href="/languages"
            className="flex items-center justify-between p-3 rounded-2xl"
            style={{
              background: 'var(--color-surface-container-low)',
              textDecoration: 'none',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-container)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-surface-container-low)')}
          >
            <div className="flex items-center gap-2">
              <Globe size={16} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-on-surface)' }}>
                Manage Languages
              </span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--color-outline)' }} />
          </a>
        </div>
      </div>

      {/* ── Master Booking Log ── */}
      <div className="card animate-fade-in-up delay-200" style={{ boxShadow: '0 2px 12px rgba(25,28,30,0.06)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarCheck size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--color-on-surface)' }}>
              Master Booking Log
            </h2>
          </div>
          <a
            href="/bookings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              textDecoration: 'none',
            }}
          >
            View All <ChevronRight size={14} />
          </a>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Lesson</th>
              <th>Teacher</th>
              <th>Date</th>
              <th>Time</th>
              <th>Availability</th>
            </tr>
          </thead>
          <tbody>
            {lessonsLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
              : lessons.slice(0, 8).map((l, i) => <BookingRow key={l.id} lesson={l} index={i} />)}
            {!lessonsLoading && lessons.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-outline)', padding: '2.5rem' }}>
                  No lessons scheduled
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
