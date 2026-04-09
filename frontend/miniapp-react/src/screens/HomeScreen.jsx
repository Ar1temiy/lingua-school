import React, { useEffect, useMemo, useState } from 'react'
import { format, isSameDay, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useBookings } from '../context/BookingsContext'
import { useAuth } from '../context/AuthContext'

/** Skeleton placeholder for booking cards */
function BookingCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-32 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-px w-full rounded mb-4" />
      <div className="flex justify-between">
        <div className="skeleton h-3.5 w-28 rounded" />
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    </div>
  )
}

/** Week calendar strip */
function WeekCalendar({ activeBookings }) {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() + i)
      return d
    })
  }, [])

  return (
    <div
      className="flex justify-between items-center px-4 py-3 animate-fade-in-up delay-100"
      style={{
        background: 'var(--color-surface-container-low)',
        borderRadius: 'var(--radius-xl)',
      }}
    >
      {days.map((date, idx) => {
        const hasLesson = activeBookings.some(b =>
          isSameDay(new Date(b.lesson.start_time), date)
        )
        const today = isToday(date)

        return (
          <div key={idx} className="flex flex-col items-center gap-2">
            <span
              style={{
                fontSize: '0.6rem',
                fontWeight: 800,
                color: 'var(--color-outline)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {format(date, 'eeeee', { locale: ru })}
            </span>
            <div
              style={{
                width: 40,
                height: 44,
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.2s ease',
                ...(today
                  ? {
                      background: 'linear-gradient(135deg, #394baf 0%, #5365c9 100%)',
                      color: '#ffffff',
                      boxShadow: '0 6px 20px rgba(57, 75, 175, 0.35)',
                      transform: 'scale(1.1)',
                    }
                  : {
                      background: 'var(--color-surface-container-lowest)',
                      color: 'var(--color-on-surface)',
                    }),
              }}
            >
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, lineHeight: 1 }}>
                {format(date, 'd')}
              </span>
              {hasLesson && (
                <div
                  className="animate-pulse-dot"
                  style={{
                    position: 'absolute',
                    bottom: 5,
                    width: 4,
                    height: 4,
                    borderRadius: '9999px',
                    background: today ? 'rgba(255,255,255,0.8)' : 'var(--color-primary)',
                  }}
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Individual booking card */
function BookingCard({ booking, onCancel, index }) {
  const lesson = booking.lesson
  const isIndividual = lesson.capacity === 1
  const langInitial = (lesson.language?.code || lesson.language?.name?.substring(0, 2) || '??').toUpperCase()

  return (
    <div
      className={`card animate-fade-in-up`}
      style={{
        animationDelay: `${index * 80}ms`,
        boxShadow: '0 2px 16px rgba(57, 75, 175, 0.06)',
      }}
    >
      {/* Header row */}
      <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
        <div className="flex items-center gap-3">
          {/* Language badge */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, rgba(57,75,175,0.12) 0%, rgba(83,101,201,0.12) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.75rem',
              color: 'var(--color-primary)',
              letterSpacing: '0.04em',
              flexShrink: 0,
            }}
          >
            {langInitial}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-on-surface)', marginBottom: 2 }}>
              {lesson.teacher_name}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>
              {lesson.language?.name}
            </p>
          </div>
        </div>

        {/* Type badge */}
        <span
          style={{
            padding: '0.3rem 0.875rem',
            borderRadius: '9999px',
            fontSize: '0.625rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            background: isIndividual
              ? 'rgba(72, 88, 171, 0.1)'
              : 'rgba(57, 75, 175, 0.1)',
            color: isIndividual ? 'var(--color-secondary)' : 'var(--color-primary)',
            flexShrink: 0,
          }}
        >
          {isIndividual ? 'Individual' : 'Group'}
        </span>
      </div>

      {/* Footer row */}
      <div
        className="flex items-center justify-between"
        style={{
          paddingTop: '1rem',
          borderTop: '1px solid rgba(57,75,175,0.06)',
        }}
      >
        <div className="flex items-center gap-2" style={{ color: 'var(--color-on-surface-variant)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>schedule</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {format(new Date(lesson.start_time), 'HH:mm')}
            {' — '}
            {format(new Date(lesson.end_time), 'HH:mm')}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-outline)',
              marginLeft: 4,
            }}
          >
            {format(new Date(lesson.start_time), 'd MMM', { locale: ru })}
          </span>
        </div>

        {/* Cancel button */}
        <button
          onClick={() => onCancel(booking.id)}
          title="Отменить запись"
          style={{
            width: 34,
            height: 34,
            borderRadius: '9999px',
            background: 'rgba(186, 26, 26, 0.08)',
            color: 'var(--color-error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s ease, transform 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(186, 26, 26, 0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(186, 26, 26, 0.08)'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
        </button>
      </div>
    </div>
  )
}

export default function HomeScreen({ setActiveTab, showToast }) {
  const { myBookings, fetchMyBookings, cancelBooking, loading } = useBookings()
  const { user } = useAuth()
  const firstName = user?.first_name || 'Студент'

  useEffect(() => {
    fetchMyBookings()
  }, [fetchMyBookings])

  const activeBookings = useMemo(() =>
    myBookings.filter(b => b.status === 'confirmed' || b.status === 'pending' || b.status === 'active'),
    [myBookings]
  )

  const handleCancel = async (bookingId) => {
    try {
      await cancelBooking(bookingId)
      showToast?.('Запись отменена')
    } catch {
      showToast?.('Ошибка при отмене', 'error')
    }
  }

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
        gap: '1.5rem',
      }}
    >
      {/* ── Welcome ── */}
      <section className="animate-fade-in-up" style={{ paddingTop: '0.5rem' }}>
        <p
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--color-on-surface-variant)',
            marginBottom: '0.25rem',
            letterSpacing: '0.01em',
          }}
        >
          Привет,
        </p>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--color-on-surface)',
            lineHeight: 1.15,
          }}
        >
          {firstName}
        </h1>
      </section>

      {/* ── Week Calendar ── */}
      <WeekCalendar activeBookings={activeBookings} />

      {/* ── Upcoming Classes ── */}
      <section>
        <div className="flex justify-between items-center animate-fade-in-up delay-150" style={{ marginBottom: '1rem' }}>
          <h2
            style={{
              fontSize: '1.1875rem',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.01em',
            }}
          >
            Upcoming Classes
          </h2>
          <button
            onClick={() => setActiveTab('Booking')}
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem 0',
            }}
          >
            See all
          </button>
        </div>

        {/* Skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <BookingCardSkeleton />
            <BookingCardSkeleton />
          </div>
        )}

        {/* Empty state */}
        {!loading && activeBookings.length === 0 && (
          <div
            className="animate-scale-in"
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
              event_busy
            </span>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
              Нет предстоящих занятий
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-outline)', marginTop: '0.25rem' }}>
              Запишитесь на урок прямо сейчас
            </p>
          </div>
        )}

        {/* Booking cards */}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {activeBookings.map((booking, idx) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
                index={idx}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA Banner ── */}
      <div
        className="animate-fade-in-up delay-300"
        style={{
          background: 'linear-gradient(135deg, #394baf 0%, #5365c9 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 12px 40px rgba(57, 75, 175, 0.25)',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            right: '80px',
            width: '120px',
            height: '120px',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
            Want more<br />practice?
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>
            Book a quick session
          </p>
        </div>
        <button
          onClick={() => setActiveTab('Booking')}
          style={{
            background: '#fff',
            color: 'var(--color-primary)',
            padding: '0.75rem 1.375rem',
            borderRadius: '9999px',
            fontWeight: 800,
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            zIndex: 1,
            position: 'relative',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          onMouseDown={e =>  { e.currentTarget.style.transform = 'scale(0.96)' }}
          onMouseUp={e =>    { e.currentTarget.style.transform = 'scale(1.04)' }}
        >
          Book now
        </button>
      </div>

      {/* Bottom spacer */}
      <div style={{ height: '0.5rem' }} />
    </main>
  )
}
