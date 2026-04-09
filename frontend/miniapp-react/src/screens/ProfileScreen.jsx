import React, { useEffect } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useBookings } from '../context/BookingsContext'
import { useAuth } from '../context/AuthContext'

/* ─── Stat Card (small) ─── */
function StatCard({ label, value, icon, delay = '' }) {
  return (
    <div
      className={`card animate-fade-in-up ${delay}`}
      style={{ boxShadow: '0 2px 12px rgba(57,75,175,0.05)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            style={{
              fontSize: '0.5625rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-outline)',
              marginBottom: '0.5rem',
            }}
          >
            {label}
          </p>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {value}
          </h2>
        </div>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '1.5rem', color: 'var(--color-outline)', opacity: 0.5 }}
        >
          {icon}
        </span>
      </div>
    </div>
  )
}

/* ─── Hero Stat Card ─── */
function HeroStatCard({ value }) {
  return (
    <div
      className="animate-fade-in-up delay-100"
      style={{
        gridColumn: '1 / -1',
        background: 'linear-gradient(135deg, #394baf 0%, #5365c9 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 12px 40px rgba(57, 75, 175, 0.22)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: -20, right: 40,
        width: 100, height: 100,
        borderRadius: '9999px', background: 'rgba(255,255,255,0.06)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -30, right: -20,
        width: 120, height: 120,
        borderRadius: '9999px', background: 'rgba(255,255,255,0.04)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{
          fontSize: '0.625rem', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.65)', marginBottom: '0.5rem',
        }}>
          Total Lessons
        </p>
        <h2 style={{
          fontSize: '3rem', fontWeight: 800,
          color: '#fff', letterSpacing: '-0.04em', lineHeight: 1,
        }}>
          {value}
        </h2>
      </div>

      <span
        className="material-symbols-outlined filled"
        style={{
          fontSize: '4.5rem',
          color: 'rgba(255,255,255,0.15)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        school
      </span>
    </div>
  )
}

/* ─── History List Item ─── */
function HistoryItem({ booking, index }) {
  const lesson = booking.lesson

  const STATUS_MAP = {
    completed: { label: 'Завершено', color: '#4caf50', bg: 'rgba(76,175,80,0.1)' },
    cancelled_by_student: { label: 'Отменено', color: 'var(--color-error)', bg: 'rgba(186,26,26,0.08)' },
    cancelled_by_staff: { label: 'Отм. школой', color: 'var(--color-tertiary)', bg: 'rgba(153,49,0,0.08)' },
  }
  const status = STATUS_MAP[booking.status] || { label: 'Завершено', color: '#4caf50', bg: 'rgba(76,175,80,0.1)' }

  return (
    <div
      className={`card animate-fade-in-up`}
      style={{
        animationDelay: `${index * 70}ms`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        padding: '1rem 1.125rem',
        boxShadow: '0 1px 8px rgba(57,75,175,0.04)',
        transition: 'transform 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '9999px',
          background: 'rgba(57,75,175,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
          class
        </span>
      </div>

      {/* Details */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <h4 style={{
          fontSize: '0.9375rem', fontWeight: 700,
          color: 'var(--color-on-surface)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {lesson.language?.name}
        </h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', marginTop: 1 }}>
          с {lesson.teacher_name}
        </p>
      </div>

      {/* Date + Status */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>
          {format(new Date(lesson.start_time), 'd MMM', { locale: ru })}
        </p>
        <span
          style={{
            display: 'inline-block',
            marginTop: 3,
            fontSize: '0.5625rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '0.2rem 0.5rem',
            borderRadius: '9999px',
            background: status.bg,
            color: status.color,
          }}
        >
          {status.label}
        </span>
      </div>
    </div>
  )
}

/* ─── Avatar initials ─── */
function AvatarPlaceholder({ name }) {
  const parts = name.split(' ')
  const initials = parts.slice(0, 2).map(p => p[0]).join('').toUpperCase()
  return (
    <div
      style={{
        width: 96,
        height: 96,
        borderRadius: '9999px',
        background: 'linear-gradient(135deg, #dee0ff 0%, #bac3ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        fontWeight: 800,
        color: 'var(--color-primary)',
        letterSpacing: '-0.02em',
        border: '4px solid var(--color-surface-container-lowest)',
        boxShadow: '0 4px 20px rgba(57,75,175,0.18)',
      }}
    >
      {initials}
    </div>
  )
}

/* ─── Main Screen ─── */
export default function ProfileScreen() {
  const { myBookings, fetchMyBookings, loading } = useBookings()
  const { user } = useAuth()

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Студент'
  const firstName = user?.first_name || 'Студент'
  const vkId = user?.vk_id || 'Неизвестно'

  useEffect(() => {
    fetchMyBookings()
  }, [fetchMyBookings])

  const totalBookings = myBookings.length
  const upcomingBookings = myBookings.filter(b => b.status === 'confirmed' || b.status === 'pending' || b.status === 'active').length
  const cancelledBookings = myBookings.filter(b => b.status?.startsWith('cancelled')).length
  const history = myBookings.filter(b => new Date(b.lesson?.end_time) < new Date())

  return (
    <main
      className="hide-scrollbar"
      style={{
        height: '100%',
        overflowY: 'auto',
        paddingTop: '5.5rem',
        paddingBottom: '1rem',
        paddingLeft: '1.25rem',
        paddingRight: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}
    >
      {/* ── Identity ── */}
      <section
        className="animate-fade-in-up"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          paddingTop: '0.75rem',
          gap: '1rem',
        }}
      >
        {/* Avatar with glow */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              inset: '-12px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, rgba(57,75,175,0.2) 0%, rgba(83,101,201,0.2) 100%)',
              filter: 'blur(16px)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative' }}>
            <AvatarPlaceholder name={fullName} />
          </div>
        </div>

        {/* Name & ID */}
        <div>
          <h1
            style={{
              fontSize: '1.625rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--color-on-surface)',
            }}
          >
            {firstName}
          </h1>
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-outline)',
              marginTop: '0.25rem',
            }}
          >
            VK ID: {vkId}
          </p>
        </div>
      </section>

      {/* ── Stats Grid ── */}
      <section
        className="animate-fade-in-up delay-50"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.875rem',
        }}
      >
        {loading ? (
          <>
            <div className="skeleton" style={{ gridColumn: '1 / -1', height: 104, borderRadius: 'var(--radius-xl)' }} />
            <div className="skeleton" style={{ height: 88, borderRadius: 'var(--radius-xl)' }} />
            <div className="skeleton" style={{ height: 88, borderRadius: 'var(--radius-xl)' }} />
          </>
        ) : (
          <>
            <HeroStatCard value={totalBookings} />
            <StatCard label="This Week" value={upcomingBookings} icon="upcoming" delay="delay-150" />
            <StatCard label="Cancelled" value={cancelledBookings} icon="cancel" delay="delay-200" />
          </>
        )}
      </section>

      {/* ── Recent Lessons ── */}
      <section className="animate-fade-in-up delay-150">
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: '0.875rem' }}
        >
          <h3
            style={{
              fontSize: '1.0625rem',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.01em',
            }}
          >
            Recent Lessons
          </h3>
          <button
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            View All
          </button>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-xl)' }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && history.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              background: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '2.5rem', color: 'var(--color-outline)', display: 'block', marginBottom: '0.75rem' }}
            >
              history
            </span>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
              История пуста
            </p>
          </div>
        )}

        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map((b, idx) => (
              <HistoryItem key={b.id} booking={b} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom spacer */}
      <div style={{ height: '0.5rem' }} />
    </main>
  )
}
