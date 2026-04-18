import { useState } from 'react'
import { Globe, Plus, Trash2, RefreshCw, X, AlertCircle } from 'lucide-react'
import { useLanguages } from '../hooks/useLanguages'
import apiClient from '../api/client'

function CreateLanguageModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', code: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await apiClient.post('/languages/', form)
      onCreated()
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create language')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-on-surface)' }}>
            Add Language
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
              Language Name
            </label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="English"
              required
            />
          </div>
          <div className="mb-6">
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>
              Language Code
            </label>
            <input
              className="input-field"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="en"
              maxLength={10}
            />
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
              {loading ? 'Creating...' : 'Add Language'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LanguagesScreen() {
  const { languages, loading, refetch, deleteLanguage } = useLanguages()
  const [showCreate, setShowCreate] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this language?')) return
    setDeletingId(id)
    try {
      await deleteLanguage(id)
    } finally {
      setDeletingId(null)
    }
  }

  const langColors = ['#394baf', '#5365c9', '#4858ab', '#008060', '#993100']

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '900px' }}>
      {showCreate && (
        <CreateLanguageModal onClose={() => setShowCreate(false)} onCreated={refetch} />
      )}

      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>
            Languages
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Manage offered languages and programs
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={refetch}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add Language
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '1.5rem' }} />
          ))}
        </div>
      ) : languages.length === 0 ? (
        <div className="card flex flex-col items-center justify-center" style={{ padding: '4rem', textAlign: 'center' }}>
          <Globe size={40} style={{ color: 'var(--color-outline)', marginBottom: '1rem' }} />
          <p style={{ fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '0.5rem' }}>No languages yet</p>
          <p style={{ color: 'var(--color-outline)', fontSize: '0.875rem' }}>Add your first language to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {languages.map((lang, i) => {
            const color = langColors[i % langColors.length]
            return (
              <div
                key={lang.id}
                className="card animate-fade-in-up"
                style={{
                  animationDelay: `${i * 60}ms`,
                  boxShadow: '0 2px 12px rgba(25,28,30,0.06)',
                  padding: '1.5rem',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="flex items-center justify-center rounded-2xl"
                    style={{ width: '48px', height: '48px', background: `${color}15` }}
                  >
                    <Globe size={22} style={{ color }} />
                  </div>
                  <button
                    className="btn-danger"
                    style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                    onClick={() => handleDelete(lang.id)}
                    disabled={deletingId === lang.id}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <p style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-on-surface)', marginBottom: '0.25rem' }}>
                  {lang.name}
                </p>
                {lang.code && (
                  <span className="chip chip-neutral" style={{ fontSize: '0.6875rem' }}>
                    {lang.code.toUpperCase()}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
