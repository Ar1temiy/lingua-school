import { useState, useMemo } from 'react'
import {
  CalendarCheck, Users, BookOpen, Clock,
  RefreshCw, Trash2, Plus, Edit2, X,
  AlertCircle, CheckCircle2, XCircle
} from 'lucide-react'
import { useTeacherAuth } from '../context/TeacherAuthContext'
import { useMyLessons } from '../hooks/useMyLessons'
import { useLanguages } from '../hooks/useLanguages'
import { format, parseISO } from 'date-fns'

// ── Generic Dialog/Modal ────────────────────────────────────
function Dialog({ isOpen, onClose, title, children, wide }) {
  if (!isOpen) return null
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={wide ? { maxWidth: '580px' } : {}}>
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-on-surface)' }}>{title}</h3>
          <button onClick={onClose} style={{ color: 'var(--color-outline)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
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

// ── Section Header ───────────────────────────────────────────
function SectionHeader({ icon: Icon, title, children }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: '32px', height: '32px', background: 'rgba(57,75,175,0.1)' }}
        >
          <Icon size={16} style={{ color: 'var(--color-primary)' }} />
        </div>
        <h2 style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--color-on-surface)' }}>
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

// ── Action Button (icon-only) ────────────────────────────────
function ActionBtn({ icon: Icon, color, title, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        color: color || 'var(--color-on-surface-variant)',
        padding: '6px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s ease',
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-container-low)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <Icon size={16} />
    </button>
  )
}

// ── Avatar Badge ─────────────────────────────────────────────
const AVATAR_COLORS = ['#394baf', '#5365c9', '#4858ab', '#993100', '#008060']
function Avatar({ name, index }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??'
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length]
  return (
    <div
      className="flex items-center justify-center rounded-full flex-shrink-0"
      style={{ width: '36px', height: '36px', background: color, fontSize: '0.8125rem', fontWeight: 700, color: 'white' }}
    >
      {initials}
    </div>
  )
}

// ── Main Teacher Dashboard ────────────────────────────────────
export default function DashboardScreen() {
  const { teacher } = useTeacherAuth()
  const { lessons, loading: lessonsLoading, refetch: refetchLessons, createLesson, updateLesson, changeLessonStatus, deleteLesson, getLessonStudents } = useMyLessons(teacher?.id)
  const { languages } = useLanguages()

  // ── Modal State ──
  const [modal, setModal] = useState({ type: null, data: null })
  const [formData, setFormData] = useState({})
  const [formError, setFormError] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const closeModal = () => { setModal({ type: null, data: null }); setFormData({}); setFormError(null); setFormLoading(false) }
  const openModal = (type, data = null) => { setFormData(data || {}); setFormError(null); setModal({ type, data }) }

  const handleAction = async (actionFn) => {
    setFormLoading(true)
    setFormError(null)
    try {
      await actionFn()
      closeModal()
    } catch (e) {
      setFormError(e.response?.data?.detail || e.message || 'An error occurred')
    } finally {
      setFormLoading(false)
    }
  }

  // ── Stats ──
  const stats = useMemo(() => {
    const scheduled = lessons.filter(l => l.status === 'scheduled').length
    const completed = lessons.filter(l => l.status === 'completed').length
    const cancelled = lessons.filter(l => l.status === 'cancelled').length
    const totalStudentSlots = lessons.reduce((acc, l) => {
      const spotsUsed = l.capacity - (l.available_slots ?? l.capacity)
      return acc + spotsUsed
    }, 0)
    return { total: lessons.length, scheduled, completed, cancelled, totalStudentSlots }
  }, [lessons])

  // ── Teacher's languages (from profile) ──
  const teacherLanguages = teacher?.languages || []

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px' }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>
            Teacher Dashboard
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Welcome back, {teacher?.first_name || 'Teacher'}! Manage your schedule below.
          </p>
        </div>
        <button className="btn-secondary" onClick={refetchLessons}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════
          QUICK STATS
          ════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="stat-card animate-fade-in-up delay-50">
          <div className="stat-icon" style={{ background: 'rgba(57,75,175,0.1)' }}>
            <CalendarCheck size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-on-surface)', lineHeight: 1 }}>
              {lessonsLoading ? '—' : stats.total}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600, marginTop: '2px' }}>
              Total Lessons
            </p>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up delay-100">
          <div className="stat-icon" style={{ background: 'rgba(0,128,96,0.1)' }}>
            <Clock size={20} style={{ color: '#008060' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-on-surface)', lineHeight: 1 }}>
              {lessonsLoading ? '—' : stats.scheduled}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600, marginTop: '2px' }}>
              Scheduled
            </p>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up delay-150">
          <div className="stat-icon" style={{ background: 'rgba(57,75,175,0.08)' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--color-secondary)' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-on-surface)', lineHeight: 1 }}>
              {lessonsLoading ? '—' : stats.completed}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600, marginTop: '2px' }}>
              Completed
            </p>
          </div>
        </div>

        <div className="stat-card animate-fade-in-up delay-200">
          <div className="stat-icon" style={{ background: 'rgba(153,49,0,0.1)' }}>
            <Users size={20} style={{ color: 'var(--color-tertiary)' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-on-surface)', lineHeight: 1 }}>
              {lessonsLoading ? '—' : stats.totalStudentSlots}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', fontWeight: 600, marginTop: '2px' }}>
              Students Enrolled
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          MODALS
          ════════════════════════════════════════════════════════════ */}

      {/* Create Lesson */}
      <Dialog isOpen={modal.type === 'createLesson'} onClose={closeModal} title="Create New Lesson">
        <form onSubmit={e => {
          e.preventDefault()
          handleAction(() => createLesson({
            language_id: formData.language_id,
            type: formData.type || 'individual',
            capacity: parseInt(formData.capacity) || 1,
            start_time: new Date(formData.start_time).toISOString(),
            end_time: new Date(formData.end_time).toISOString(),
          }))
        }}>
          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Language</label>
            <select className="input-field" required value={formData.language_id || ''} onChange={e => setFormData({ ...formData, language_id: e.target.value })}>
              <option value="" disabled>Select language...</option>
              {(teacherLanguages.length > 0 ? teacherLanguages : languages).map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Type</label>
            <select className="input-field" value={formData.type || 'individual'} onChange={e => setFormData({ ...formData, type: e.target.value })}>
              <option value="individual">Individual</option>
              <option value="group">Group</option>
            </select>
          </div>
          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Capacity</label>
            <input className="input-field" type="number" min="1" max="50" required value={formData.capacity || ''} placeholder="1" onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
          </div>
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Start Time</label>
              <input className="input-field" type="datetime-local" required value={formData.start_time || ''} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
            </div>
            <div className="flex-1">
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>End Time</label>
              <input className="input-field" type="datetime-local" required value={formData.end_time || ''} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
            </div>
          </div>
          {formError && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl p-3" style={{ background: 'var(--color-error-container)' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--color-on-error-container)', fontWeight: 600 }}>{formError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={formLoading}>{formLoading ? 'Creating...' : 'Create Lesson'}</button>
          </div>
        </form>
      </Dialog>

      {/* Edit Lesson */}
      <Dialog isOpen={modal.type === 'editLesson'} onClose={closeModal} title="Edit Lesson">
        <form onSubmit={e => {
          e.preventDefault()
          const update = {}
          if (formData.start_time) update.start_time = new Date(formData.start_time).toISOString()
          if (formData.end_time) update.end_time = new Date(formData.end_time).toISOString()
          if (formData.capacity) update.capacity = parseInt(formData.capacity)
          handleAction(() => updateLesson(modal.data.id, update))
        }}>
          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Start Time</label>
            <input className="input-field" type="datetime-local" value={formData.start_time ? formData.start_time.substring(0, 16) : ''} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
          </div>
          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>End Time</label>
            <input className="input-field" type="datetime-local" value={formData.end_time ? formData.end_time.substring(0, 16) : ''} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
          </div>
          <div className="mb-6">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Capacity</label>
            <input className="input-field" type="number" min="1" value={formData.capacity || ''} onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
          </div>
          {formError && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl p-3" style={{ background: 'var(--color-error-container)' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--color-on-error-container)', fontWeight: 600 }}>{formError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </Dialog>

      {/* Students List */}
      <Dialog isOpen={modal.type === 'studentsList'} onClose={closeModal} title={`Students Enrolled (${modal.data?.students?.length || 0})`}>
        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {modal.data?.students?.length > 0 ? modal.data.students.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 mb-2" style={{ padding: '0.75rem', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container-low)' }}>
              <Avatar name={`${s.first_name} ${s.last_name}`} index={i} />
              <div className="flex-1">
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-on-surface)' }}>{s.first_name} {s.last_name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)' }}>VK ID: {s.vk_id}</p>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center py-8">
              <Users size={32} style={{ color: 'var(--color-outline-variant)', marginBottom: '0.75rem' }} />
              <p style={{ color: 'var(--color-outline)', textAlign: 'center', fontSize: '0.875rem' }}>No students enrolled yet.</p>
            </div>
          )}
        </div>
      </Dialog>

      {/* ════════════════════════════════════════════════════════════
          MY SCHEDULE
          ════════════════════════════════════════════════════════════ */}
      <div className="card animate-fade-in-up delay-250" style={{ boxShadow: '0 2px 12px rgba(25,28,30,0.06)', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 1.5rem 0' }}>
          <SectionHeader icon={CalendarCheck} title="My Schedule">
            <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8125rem' }} onClick={() => openModal('createLesson')}>
              <Plus size={14} /> New Lesson
            </button>
          </SectionHeader>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ padding: '0.75rem 1.5rem' }}>Language</th>
              <th>Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Capacity</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', padding: '0.75rem 1.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessonsLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              : lessons.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-outline)', padding: '3rem' }}>
                    <div className="flex flex-col items-center gap-2">
                      <CalendarCheck size={32} style={{ color: 'var(--color-outline-variant)' }} />
                      <p style={{ fontWeight: 600 }}>No lessons yet</p>
                      <p style={{ fontSize: '0.8125rem' }}>Create your first lesson to get started</p>
                    </div>
                  </td>
                </tr>
              ) : lessons.map((l, i) => {
                  const startStr = l.start_time ? format(parseISO(l.start_time), 'MMM d, yyyy') : '—'
                  const timeStr = l.start_time && l.end_time
                    ? `${format(parseISO(l.start_time), 'HH:mm')} — ${format(parseISO(l.end_time), 'HH:mm')}`
                    : '—'
                  const spotsLeft = l.available_slots ?? (l.capacity - (l.active_bookings_count ?? 0))
                  const isFull = spotsLeft <= 0

                  const statusChip = {
                    scheduled: 'chip-success',
                    completed: 'chip-neutral',
                    cancelled: 'chip-error',
                  }

                  return (
                    <tr key={l.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                      <td style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} style={{ color: 'var(--color-primary)' }} />
                          {l.language_name || '—'}
                        </div>
                      </td>
                      <td>
                        <span className={`chip ${l.type === 'group' ? 'chip-active' : 'chip-neutral'}`}>
                          {l.type === 'group' ? 'Group' : 'Individual'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.875rem' }}>{startStr}</td>
                      <td style={{ fontSize: '0.875rem', fontWeight: 600 }}>{timeStr}</td>
                      <td>
                        <span className={`chip ${isFull ? 'chip-error' : 'chip-success'}`}>
                          {isFull ? 'Full' : `${spotsLeft}/${l.capacity}`}
                        </span>
                      </td>
                      <td>
                        <span className={`chip ${statusChip[l.status] || 'chip-neutral'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.75rem 1.5rem' }}>
                        <div className="flex items-center justify-end gap-1">
                          <ActionBtn
                            icon={Users}
                            color="var(--color-primary)"
                            title="View Students"
                            onClick={async () => {
                              try {
                                const students = await getLessonStudents(l.id)
                                openModal('studentsList', { ...l, students })
                              } catch (e) {
                                alert(e.response?.data?.detail || 'Error fetching students')
                              }
                            }}
                          />
                          <ActionBtn
                            icon={Edit2}
                            title="Edit Time/Capacity"
                            onClick={() => openModal('editLesson', {
                              ...l,
                              start_time: l.start_time ? l.start_time.substring(0, 16) : '',
                              end_time: l.end_time ? l.end_time.substring(0, 16) : '',
                            })}
                          />
                          {l.status === 'scheduled' && (
                            <>
                              <ActionBtn
                                icon={CheckCircle2}
                                color="#008060"
                                title="Mark Completed"
                                onClick={async () => {
                                  if (window.confirm('Отметить урок как завершённый?')) {
                                    try { await changeLessonStatus(l.id, 'completed') } catch (e) { alert(e.response?.data?.detail || 'Error') }
                                  }
                                }}
                              />
                              <ActionBtn
                                icon={XCircle}
                                color="var(--color-error)"
                                title="Cancel Lesson"
                                onClick={async () => {
                                  if (window.confirm('Отменить это занятие?')) {
                                    try { await changeLessonStatus(l.id, 'cancelled') } catch (e) { alert(e.response?.data?.detail || 'Error') }
                                  }
                                }}
                              />
                            </>
                          )}
                          <ActionBtn
                            icon={Trash2}
                            color="var(--color-error)"
                            title="Delete Lesson"
                            onClick={async () => {
                              if (window.confirm('Удалить это занятие полностью?')) {
                                try { await deleteLesson(l.id) } catch (e) { alert(e.response?.data?.detail || 'Error') }
                              }
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
        {!lessonsLoading && lessons.length > 0 && (
          <div style={{ padding: '0.75rem 1.5rem', textAlign: 'right', borderTop: '1px solid var(--color-surface-container-low)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-outline)' }}>
              {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} total
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
