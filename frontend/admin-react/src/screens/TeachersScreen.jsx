import { useState } from 'react'
import { Users, Plus, Trash2, Search, RefreshCw, X, AlertCircle, Languages } from 'lucide-react'
import { useStaff } from '../hooks/useStaff'
import { useLanguages } from '../hooks/useLanguages'
import apiClient from '../api/client'

function ManageLanguagesModal({ teacher, onClose, onUpdated }) {
  const { languages, loading: langsLoading } = useLanguages()
  const { assignLanguage } = useStaff()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const teacherLangIds = teacher.languages?.map(l => l.id) || []

  const handleToggleLanguage = async (langId) => {
    setError(null)
    setLoading(true)
    try {
      // Backend only has POST for assign, let's assume it handles toggling or just assign for now
      // If we need unassign, we'd need a DELETE endpoint.
      await assignLanguage(teacher.id, langId)
      onUpdated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update language')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: '400px' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-on-surface)' }}>
              Manage Languages
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-outline)' }}>{teacher.full_name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-outline)' }}>
            <X size={20} />
          </button>
        </div>

        {langsLoading ? (
          <div className="flex justify-center p-8"><RefreshCw className="animate-spin" /></div>
        ) : (
          <div className="flex flex-col gap-2 mb-6">
            {languages.map(lang => {
              const isAssigned = teacherLangIds.includes(lang.id)
              return (
                <button
                  key={lang.id}
                  onClick={() => handleToggleLanguage(lang.id)}
                  disabled={loading}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${isAssigned
                      ? 'style-assigned'
                      : 'style-unassigned'
                    }`}
                  style={{
                    border: '1px solid var(--color-surface-container-high)',
                    background: isAssigned ? 'var(--color-primary-container)' : 'var(--color-surface)',
                    color: isAssigned ? 'var(--color-on-primary-container)' : 'var(--color-on-surface)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{lang.name}</span>
                  {isAssigned && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }} />}
                </button>
              )
            })}
          </div>
        )}

        {error && <p style={{ color: 'var(--color-error)', fontSize: '0.8125rem', marginBottom: '1rem' }}>{error}</p>}

        <button className="btn-primary w-full justify-center" onClick={onClose}>Done</button>
      </div>
    </div>
  )
}

function CreateStaffModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'teacher' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await apiClient.post('/staff/', form)
      onCreated()
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create staff member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-on-surface)' }}>
            Add Staff Member
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-outline)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>
              Full Name
            </label>
            <input
              className="input-field"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Anna Schmidt"
              required
            />
          </div>
          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>
              Email
            </label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="teacher@school.com"
              required
            />
          </div>
          <div className="mb-4">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="mb-6">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>
              Role
            </label>
            <select
              className="input-field"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="teacher">Teacher</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl p-3" style={{ background: 'var(--color-error-container)' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--color-on-error-container)', fontWeight: 600 }}>{error}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TeachersScreen() {
  const { staff, loading, refetch, deleteStaff } = useStaff()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [managingTeacher, setManagingTeacher] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const filtered = staff.filter((s) =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member?')) return
    setDeletingId(id)
    try {
      await deleteStaff(id)
    } finally {
      setDeletingId(null)
    }
  }

  const avatarColors = ['#394baf', '#5365c9', '#4858ab', '#993100', '#008060']

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1200px' }}>
      {showCreate && (
        <CreateStaffModal onClose={() => setShowCreate(false)} onCreated={refetch} />
      )}
      {managingTeacher && (
        <ManageLanguagesModal
          teacher={managingTeacher}
          onClose={() => setManagingTeacher(null)}
          onUpdated={refetch}
        />
      )}

      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>
            Teachers
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Manage staff members and their language assignments
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={refetch}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add Staff
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-6 animate-fade-in-up" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)', pointerEvents: 'none' }} />
          <input
            className="input-field"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card animate-fade-in-up delay-100" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ padding: '1rem 1.5rem' }}>Staff Member</th>
              <th>Role</th>
              <th>Languages</th>
              <th>Email</th>
              <th style={{ textAlign: 'right', padding: '1rem 1.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: '20px' }} /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-outline)', padding: '3rem' }}>
                  {search ? 'No results found' : 'No staff members yet'}
                </td>
              </tr>
            ) : (
              filtered.map((member, i) => {
                const initials = member.full_name
                  ? member.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                  : '??'
                const color = avatarColors[i % avatarColors.length]
                const langs = member.languages?.map((l) => l.name).join(', ') || '—'
                return (
                  <tr key={member.id} className="animate-fade-in">
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div className="flex items-center gap-3">
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {initials}
                        </div>
                        <p style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>{member.full_name}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`chip ${member.role === 'admin' ? 'chip-warning' : 'chip-active'}`}>
                        {member.role === 'admin' ? 'Admin' : 'Teacher'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>
                      <div className="flex items-center gap-2">
                        <span>{langs}</span>
                        {member.role === 'teacher' && (
                          <button
                            onClick={() => setManagingTeacher(member)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: '4px' }}
                            title="Manage Languages"
                          >
                            <Languages size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem' }}>{member.email}</td>
                    <td style={{ textAlign: 'right', padding: '1rem 1.5rem' }}>
                      <button
                        className="btn-danger"
                        style={{ padding: '0.375rem 0.875rem' }}
                        onClick={() => handleDelete(member.id)}
                        disabled={deletingId === member.id}
                      >
                        <Trash2 size={14} />
                        {deletingId === member.id ? 'Deleting...' : 'Delete'}
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
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-outline)', marginTop: '1rem', textAlign: 'right' }}>
          {filtered.length} of {staff.length} staff members
        </p>
      )}
    </div>
  )
}
