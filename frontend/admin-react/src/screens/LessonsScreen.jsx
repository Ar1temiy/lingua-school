import { CalendarCheck, RefreshCw, Search, Plus, X, AlertCircle, Clock, User, Globe, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useLessons } from '../hooks/useLessons'
import { useStaff } from '../hooks/useStaff'
import { useLanguages } from '../hooks/useLanguages'
import { format, parseISO, addMinutes } from 'date-fns'

function CreateLessonModal({ onClose, onCreated }) {
  const { createLesson } = useLessons()
  const { staff } = useStaff()
  const { languages } = useLanguages()
  
  const teachers = useMemo(() => staff.filter(s => s.role === 'teacher'), [staff])
  
  const [form, setForm] = useState({
    teacher_id: '',
    language_id: '',
    type: 'individual',
    capacity: 1,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '12:00',
    duration: 60
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      const start = new Date(`${form.start_date}T${form.start_time}`)
      const end = addMinutes(start, parseInt(form.duration))
      
      await createLesson({
        teacher_id: form.teacher_id,
        language_id: form.language_id,
        type: form.type,
        capacity: parseInt(form.capacity),
        start_time: start.toISOString(),
        end_time: end.toISOString()
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create lesson')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: '480px' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-on-surface)' }}>
            Schedule New Lesson
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-outline)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Teacher</label>
              <select 
                className="input-field" 
                value={form.teacher_id} 
                onChange={e => setForm({...form, teacher_id: e.target.value})}
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Language</label>
              <select 
                className="input-field" 
                value={form.language_id} 
                onChange={e => setForm({...form, language_id: e.target.value})}
                required
              >
                <option value="">Select Language</option>
                {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Type</label>
              <select 
                className="input-field" 
                value={form.type} 
                onChange={e => setForm({...form, type: e.target.value})}
              >
                <option value="individual">Individual</option>
                <option value="group">Group Class</option>
              </select>
            </div>
            <div>
              <label className="input-label">Capacity</label>
              <input 
                type="number" 
                className="input-field" 
                value={form.capacity} 
                onChange={e => setForm({...form, capacity: e.target.value})}
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Date</label>
              <input 
                type="date" 
                className="input-field" 
                value={form.start_date} 
                onChange={e => setForm({...form, start_date: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="input-label">Start Time</label>
              <input 
                type="time" 
                className="input-field" 
                value={form.start_time} 
                onChange={e => setForm({...form, start_time: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label">Duration (minutes)</label>
            <select 
              className="input-field" 
              value={form.duration} 
              onChange={e => setForm({...form, duration: e.target.value})}
            >
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-error-container flex gap-2">
              <AlertCircle size={16} className="text-error flex-shrink-0" />
              <p className="text-xs font-semibold text-on-error-container">{error}</p>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? 'Scheduling...' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LessonsScreen() {
  const { lessons, loading, refetch } = useLessons()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const filtered = lessons.filter((l) =>
    l.teacher?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.language?.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.type?.toLowerCase().includes(search.toLowerCase())
  )

  const typeLabels = {
    individual: 'Individual',
    group: 'Group Session'
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px' }}>
      {showCreate && <CreateLessonModal onClose={() => setShowCreate(false)} onCreated={refetch} />}

      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>
            Lessons & Monitoring
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Schedule and track educational activities across all languages
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={refetch}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Lesson
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card mb-6 animate-fade-in-up" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)', pointerEvents: 'none' }} />
          <input
            className="input-field"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search by teacher, language or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card animate-fade-in-up delay-100" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ padding: '1rem 1.5rem' }}>Activity</th>
              <th>Teacher</th>
              <th>Scheduled</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Record</th>
              <th style={{ textAlign: 'right', padding: '1rem 1.5rem' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: '18px' }} /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-outline)', padding: '4rem' }}>
                  <CalendarCheck size={40} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                  <p style={{ fontWeight: 600 }}>{search ? 'No matches found' : 'No lessons scheduled yet'}</p>
                </td>
              </tr>
            ) : (
              filtered.map((lesson, i) => {
                const spotsLeft = lesson.capacity - (lesson.active_bookings_count ?? 0)
                const isFull = spotsLeft <= 0
                const teacherName = lesson.teacher?.full_name || 'Unassigned'
                const langName = lesson.language?.name || 'N/A'
                
                let dateStr = '—'
                let durationStr = '—'
                if (lesson.start_time) {
                  try { 
                    const start = parseISO(lesson.start_time)
                    const end = parseISO(lesson.end_time)
                    dateStr = format(start, 'MMM d, HH:mm')
                    durationStr = Math.round((end - start) / 60000) + ' min'
                  } catch {}
                }

                return (
                  <tr key={lesson.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-xl bg-surface-container-high" style={{ width: '40px', height: '40px' }}>
                          <Globe size={18} className="text-primary" />
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, color: 'var(--color-on-surface)', fontSize: '0.9375rem' }}>{langName}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600 }}>{typeLabels[lesson.type] || lesson.type}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-outline" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>{teacherName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-outline" />
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>{dateStr}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>{durationStr}</td>
                    <td>
                      <span className={`chip ${isFull ? 'chip-error' : 'chip-success'}`}>
                        {isFull ? 'Full Session' : `${lesson.active_bookings_count ?? 0}/${lesson.capacity} Booked`}
                      </span>
                    </td>
                    <td>
                      <span className="chip chip-neutral" style={{ fontSize: '0.6875rem', fontWeight: 800 }}>LIVE</span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '1rem 1.5rem' }}>
                      <button className="flex items-center gap-1 ml-auto text-primary font-bold text-xs hover:opacity-70 transition-opacity">
                        Details <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-outline)', marginTop: '1.25rem', textAlign: 'right', fontWeight: 600 }}>
          Monitoring {filtered.length} active sessions
        </p>
      )}
    </div>
  )
}
