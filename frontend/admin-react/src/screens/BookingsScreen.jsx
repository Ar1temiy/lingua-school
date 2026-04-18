import { CalendarCheck, RefreshCw, Search } from 'lucide-react'
import { useState } from 'react'
import { useLessons } from '../hooks/useLessons'
import { format, parseISO } from 'date-fns'

export default function BookingsScreen() {
  const { lessons, loading, refetch } = useLessons()
  const [search, setSearch] = useState('')

  const filtered = lessons.filter((l) =>
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.teacher?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.language?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const levelLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    business: 'Business',
    conversational: 'Conversational',
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1300px' }}>
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>
            Bookings &amp; Lessons
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Full master booking log across all teachers
          </p>
        </div>
        <button className="btn-secondary" onClick={refetch}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6 animate-fade-in-up" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)', pointerEvents: 'none' }} />
          <input
            className="input-field"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search by lesson title, teacher, or language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card animate-fade-in-up delay-100" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ padding: '1rem 1.5rem' }}>Lesson</th>
              <th>Language</th>
              <th>Teacher</th>
              <th>Level</th>
              <th>Scheduled</th>
              <th>Capacity</th>
              <th>Bookings</th>
              <th>Availability</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: '18px' }} /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--color-outline)', padding: '3rem' }}>
                  <CalendarCheck size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p>{search ? 'No results found' : 'No lessons scheduled'}</p>
                </td>
              </tr>
            ) : (
              filtered.map((lesson, i) => {
                const spotsLeft = lesson.capacity - (lesson.active_bookings_count ?? 0)
                const isFull = spotsLeft <= 0
                const isAlmostFull = !isFull && spotsLeft <= 2

                let dateStr = '—'
                if (lesson.scheduled_at) {
                  try { dateStr = format(parseISO(lesson.scheduled_at), 'MMM d, yyyy · HH:mm') } catch {}
                }

                return (
                  <tr key={lesson.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <p style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>{lesson.title}</p>
                    </td>
                    <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>
                      {lesson.language?.name || '—'}
                    </td>
                    <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', fontWeight: 600 }}>
                      {lesson.teacher?.full_name || '—'}
                    </td>
                    <td>
                      <span className="chip chip-neutral" style={{ fontSize: '0.6875rem' }}>
                        {levelLabels[lesson.level] || lesson.level || '—'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>{dateStr}</td>
                    <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', textAlign: 'center' }}>
                      {lesson.capacity}
                    </td>
                    <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', textAlign: 'center' }}>
                      {lesson.active_bookings_count ?? 0}
                    </td>
                    <td>
                      <span className={`chip ${isFull ? 'chip-error' : isAlmostFull ? 'chip-warning' : 'chip-success'}`}>
                        {isFull ? 'Full' : `${spotsLeft} spots`}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-outline)', marginTop: '1rem', textAlign: 'right' }}>
          {filtered.length} of {lessons.length} lessons
        </p>
      )}
    </div>
  )
}
