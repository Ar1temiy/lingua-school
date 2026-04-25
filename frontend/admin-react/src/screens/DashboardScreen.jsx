import { useState, useCallback } from 'react'
import {
  Users, Globe, CalendarCheck, BookOpen,
  RefreshCw, Trash2, Plus, Edit2, X, BookMarked,
  AlertCircle, ChevronRight
} from 'lucide-react'
import { useStaff } from '../hooks/useStaff'
import { useLessons } from '../hooks/useLessons'
import { useLanguages } from '../hooks/useLanguages'
import { useBookings } from '../hooks/useBookings'
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

// ── Action Button (icon-only, for Tables) ────────────────────
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

// ── Main Dashboard ────────────────────────────────────────────
export default function DashboardScreen() {
  const { staff, loading: staffLoading, refetch: refetchStaff, createStaff, deleteStaff, assignLanguage } = useStaff()
  const { languages, loading: langLoading, refetch: refetchLanguages, createLanguage, updateLanguage, deleteLanguage } = useLanguages()
  const { lessons, loading: lessonsLoading, refetch: refetchLessons, updateLesson, changeLessonStatus, getLessonStudents } = useLessons()
  const { bookings, loading: bookingsLoading, refetch: refetchBookings, updateBookingStatus } = useBookings()

  const refreshAll = () => { refetchStaff(); refetchLanguages(); refetchLessons(); refetchBookings() }

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

  // ── Helper: full name from first/last ──
  const fullName = (obj) => `${obj?.first_name || ''} ${obj?.last_name || ''}`.trim() || '—'

  // ── Deleting state ──
  const [deletingId, setDeletingId] = useState(null)
  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Удалить этого сотрудника?')) return
    setDeletingId(id)
    try { await deleteStaff(id) } finally { setDeletingId(null) }
  }

  const teachers = staff.filter(s => s.role === 'teacher')

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
        <button className="btn-secondary" onClick={refreshAll}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════
          MODALS
          ════════════════════════════════════════════════════════════ */}

      {/* Create Teacher */}
      <Dialog isOpen={modal.type === 'createTeacher'} onClose={closeModal} title="Add Staff Member">
        <form onSubmit={e => { e.preventDefault(); handleAction(() => createStaff({ first_name: formData.first_name, last_name: formData.last_name, email: formData.email, password: formData.password, role: formData.role || 'teacher' })) }}>
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>First Name</label>
              <input className="input-field" placeholder="Anna" required value={formData.first_name || ''} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
            </div>
            <div className="flex-1">
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Last Name</label>
              <input className="input-field" placeholder="Schmidt" required value={formData.last_name || ''} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
            </div>
          </div>
          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Email</label>
            <input className="input-field" type="email" placeholder="teacher@school.com" required value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Password</label>
            <input className="input-field" type="password" placeholder="••••••••" required value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <div className="mb-6">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Role</label>
            <select className="input-field" value={formData.role || 'teacher'} onChange={e => setFormData({ ...formData, role: e.target.value })}>
              <option value="teacher">Teacher</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          {formError && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl p-3" style={{ background: 'var(--color-error-container)' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--color-on-error-container)', fontWeight: 600 }}>{formError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={formLoading}>{formLoading ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Dialog>

      {/* Assign Language */}
      <Dialog isOpen={modal.type === 'assignLanguage'} onClose={closeModal} title={`Assign Language to ${fullName(modal.data)}`}>
        <div className="flex flex-col gap-4">
          <select className="input-field" value={formData.language_id || ''} onChange={e => setFormData({ ...formData, language_id: e.target.value })}>
            <option value="" disabled>Select language...</option>
            {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          {formError && (
            <div className="flex items-start gap-2 rounded-2xl p-3" style={{ background: 'var(--color-error-container)' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--color-on-error-container)', fontWeight: 600 }}>{formError}</p>
            </div>
          )}
          <button className="btn-primary" style={{ justifyContent: 'center' }} disabled={!formData.language_id || formLoading}
            onClick={() => handleAction(() => assignLanguage(modal.data.id, formData.language_id))}>
            {formLoading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </Dialog>

      {/* Create / Edit Language */}
      <Dialog isOpen={modal.type === 'createLanguage' || modal.type === 'editLanguage'} onClose={closeModal} title={modal.type === 'createLanguage' ? "Add Language" : "Edit Language"}>
        <form onSubmit={e => {
          e.preventDefault()
          if (modal.type === 'createLanguage') handleAction(() => createLanguage({ name: formData.name, code: formData.code }))
          else handleAction(() => updateLanguage(modal.data.id, { name: formData.name, code: formData.code }))
        }}>
          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Language Name</label>
            <input className="input-field" placeholder="English" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="mb-6">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>Code (ISO)</label>
            <input className="input-field" placeholder="en" required value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value })} />
          </div>
          {formError && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl p-3" style={{ background: 'var(--color-error-container)' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--color-on-error-container)', fontWeight: 600 }}>{formError}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={formLoading}>{formLoading ? 'Saving...' : (modal.type === 'createLanguage' ? 'Create' : 'Save')}</button>
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
        <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {modal.data?.students?.length > 0 ? modal.data.students.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 mb-2" style={{ padding: '0.75rem', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container-low)' }}>
              <Avatar name={`${s.first_name} ${s.last_name}`} index={i} />
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-on-surface)' }}>{s.first_name} {s.last_name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)' }}>VK ID: {s.vk_id}</p>
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--color-outline)', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>No students enrolled yet.</p>
          )}
        </div>
      </Dialog>


      {/* ════════════════════════════════════════════════════════════
          TEACHER MANAGEMENT + LANGUAGES (side by side)
          ════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-6 mb-8">

        {/* ── TEACHER MANAGEMENT (2/3 width) ── like /admin/teachers ── */}
        <div className="col-span-2 card animate-fade-in-up delay-100" style={{ boxShadow: '0 2px 12px rgba(25,28,30,0.06)', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 1.5rem 0' }}>
            <SectionHeader icon={Users} title="Teacher Management">
              <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8125rem' }} onClick={() => openModal('createTeacher')}>
                <Plus size={14}/> Add Staff
              </button>
            </SectionHeader>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem' }}>Staff Member</th>
                <th>Role</th>
                <th>Languages</th>
                <th>Email</th>
                <th style={{ textAlign: 'right', padding: '0.75rem 1.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffLoading
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                : staff.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-outline)', padding: '2.5rem' }}>No staff members yet</td></tr>
                ) : staff.map((member, i) => {
                  const langs = member.languages?.map(l => l.name).join(', ') || '—'
                  return (
                    <tr key={member.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                      <td style={{ padding: '0.75rem 1.5rem' }}>
                        <div className="flex items-center gap-3">
                          <Avatar name={fullName(member)} index={i} />
                          <p style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>{fullName(member)}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`chip ${member.role === 'admin' ? 'chip-warning' : 'chip-active'}`}>
                          {member.role === 'admin' ? 'Admin' : 'Educator'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>{langs}</td>
                      <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>{member.email}</td>
                      <td style={{ textAlign: 'right', padding: '0.75rem 1.5rem' }}>
                        <div className="flex items-center justify-end gap-1">
                          <ActionBtn icon={BookOpen} color="var(--color-primary)" title="Assign Language" onClick={() => openModal('assignLanguage', member)} />
                          <ActionBtn icon={Trash2} color="var(--color-error)" title="Delete" onClick={() => handleDeleteStaff(member.id)} disabled={deletingId === member.id} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
          {!staffLoading && (
            <div style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-outline)' }}>
                {staff.length} staff member{staff.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* ── LANGUAGES (1/3 width — compact) ── */}
        <div className="card animate-fade-in-up delay-150" style={{ boxShadow: '0 2px 12px rgba(25,28,30,0.06)' }}>
          <SectionHeader icon={Globe} title="Languages">
            <button className="btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }} onClick={() => openModal('createLanguage')}>
              <Plus size={13}/> Add
            </button>
          </SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {langLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '44px', borderRadius: 'var(--radius-md)' }} />
              ))
            ) : languages.length === 0 ? (
              <p style={{ color: 'var(--color-outline)', textAlign: 'center', padding: '1.5rem', fontSize: '0.875rem' }}>No languages yet</p>
            ) : languages.map((lang, i) => (
              <div
                key={lang.id}
                className="flex items-center justify-between animate-fade-in"
                style={{
                  animationDelay: `${i * 50}ms`,
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-container-low)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-container)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface-container-low)'}
              >
                <div className="flex items-center gap-2">
                  <Globe size={14} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-on-surface)' }}>{lang.name}</span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-outline)', fontWeight: 600 }}>({lang.code})</span>
                </div>
                <div className="flex items-center gap-1">
                  <ActionBtn icon={Edit2} title="Edit" onClick={() => openModal('editLanguage', lang)} />
                  <ActionBtn icon={Trash2} color="var(--color-error)" title="Delete" onClick={async () => { if (window.confirm('Удалить этот язык?')) await deleteLanguage(lang.id) }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════
          LESSONS CONTROL (full width)
          ════════════════════════════════════════════════════════════ */}
      <div className="card animate-fade-in-up delay-200 mb-8" style={{ boxShadow: '0 2px 12px rgba(25,28,30,0.06)' }}>
        <SectionHeader icon={CalendarCheck} title="Lessons Control" />
        <table className="admin-table">
          <thead>
            <tr>
              <th>Language</th>
              <th>Type</th>
              <th>Teacher</th>
              <th>Start</th>
              <th>End</th>
              <th>Capacity</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessonsLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
              : lessons.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--color-outline)', padding: '2.5rem' }}>No lessons found</td></tr>
              ) : lessons.map((l, i) => {
                  const startStr = l.start_time ? format(parseISO(l.start_time), 'MMM d, HH:mm') : '—'
                  const endStr = l.end_time ? format(parseISO(l.end_time), 'HH:mm') : '—'
                  const spotsLeft = l.available_slots ?? (l.capacity - (l.active_bookings_count ?? 0))
                  const isFull = spotsLeft <= 0
                  return (
                    <tr key={l.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                      <td style={{ fontWeight: 700 }}>{l.language_name || '—'}</td>
                      <td><span className={`chip ${l.type === 'group' ? 'chip-active' : 'chip-neutral'}`}>{l.type}</span></td>
                      <td style={{ fontSize: '0.875rem' }}>{l.teacher_name || '—'}</td>
                      <td style={{ fontSize: '0.875rem' }}>{startStr}</td>
                      <td style={{ fontSize: '0.875rem' }}>{endStr}</td>
                      <td>
                        <span className={`chip ${isFull ? 'chip-error' : 'chip-success'}`}>
                          {isFull ? 'Full' : `${spotsLeft}/${l.capacity}`}
                        </span>
                      </td>
                      <td>
                        <span className={`chip ${l.status === 'cancelled' ? 'chip-error' : l.status === 'completed' ? 'chip-neutral' : 'chip-success'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1">
                          <ActionBtn icon={Users} color="var(--color-primary)" title="View Students" onClick={async () => {
                            try {
                              const students = await getLessonStudents(l.id)
                              openModal('studentsList', { ...l, students })
                            } catch (e) { alert(e.response?.data?.detail || 'Error fetching students') }
                          }} />
                          <ActionBtn icon={Edit2} title="Edit Time/Capacity" onClick={() => openModal('editLesson', {
                            ...l,
                            start_time: l.start_time ? l.start_time.substring(0, 16) : '',
                            end_time: l.end_time ? l.end_time.substring(0, 16) : '',
                          })} />
                          {l.status !== 'cancelled' && (
                            <ActionBtn icon={X} color="var(--color-error)" title="Cancel Lesson" onClick={async () => {
                              if (window.confirm('Отменить это занятие?')) {
                                try { await changeLessonStatus(l.id, 'cancelled') } catch (e) { alert(e.response?.data?.detail || 'Error') }
                              }
                            }} />
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </div>

      {/* ════════════════════════════════════════════════════════════
          ALL BOOKINGS (full width)
          ════════════════════════════════════════════════════════════ */}
      <div className="card animate-fade-in-up delay-250" style={{ boxShadow: '0 2px 12px rgba(25,28,30,0.06)' }}>
        <SectionHeader icon={BookMarked} title="All Bookings" />
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Lesson</th>
              <th>Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Change Status</th>
            </tr>
          </thead>
          <tbody>
            {bookingsLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
              : bookings.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-outline)', padding: '2.5rem' }}>No bookings found</td></tr>
              ) : bookings.map((b, i) => {
                  const studentName = b.student ? `${b.student.first_name || ''} ${b.student.last_name || ''}`.trim() : '—'
                  const lessonInfo = b.lesson?.language_name || '—'
                  const lessonDate = b.lesson?.start_time ? format(parseISO(b.lesson.start_time), 'MMM d, HH:mm') : '—'

                  const statusColors = {
                    active: 'chip-success',
                    cancelled_by_student: 'chip-neutral',
                    cancelled_by_school: 'chip-error',
                  }
                  const statusLabels = {
                    active: 'Active',
                    cancelled_by_student: 'Cancelled (Student)',
                    cancelled_by_school: 'Cancelled (School)',
                  }

                  return (
                    <tr key={b.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                      <td style={{ fontWeight: 700 }}>{studentName}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{lessonInfo}</span>
                        {b.lesson?.teacher_name && <span style={{ fontSize: '0.75rem', color: 'var(--color-outline)', marginLeft: '0.5rem' }}>({b.lesson.teacher_name})</span>}
                      </td>
                      <td style={{ fontSize: '0.875rem' }}>{lessonDate}</td>
                      <td>
                        <span className={`chip ${statusColors[b.status] || 'chip-neutral'}`}>{statusLabels[b.status] || b.status}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <select
                          className="input-field"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem', width: 'auto', display: 'inline-block' }}
                          value={b.status}
                          onChange={async (e) => {
                            if (window.confirm(`Изменить статус на "${e.target.value}"?`)) {
                              try { await updateBookingStatus(b.id, e.target.value) } catch (err) { alert(err.response?.data?.detail || 'Error') }
                            }
                          }}
                        >
                          <option value="active">Active</option>
                          <option value="cancelled_by_school">Cancelled (School)</option>
                          <option value="cancelled_by_student">Cancelled (Student)</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </div>

    </div>
  )
}
