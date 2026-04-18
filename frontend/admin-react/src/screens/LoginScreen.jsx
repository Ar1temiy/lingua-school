import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function LoginScreen() {
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        background: 'linear-gradient(160deg, #f7f9fc 0%, #eceef8 100%)',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'fixed',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(83,101,201,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(57,75,175,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="animate-scale-in" style={{ width: '100%', maxWidth: '440px', padding: '1.5rem' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="flex items-center justify-center rounded-3xl mb-4"
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #394baf 0%, #5365c9 100%)',
              boxShadow: '0 16px 40px rgba(57,75,175,0.3)',
            }}
          >
            <GraduationCap size={32} color="white" />
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--color-on-surface)',
              textAlign: 'center',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Lingua Admin
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Sign in to your control center
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem', boxShadow: '0 8px 40px rgba(25,28,30,0.08)' }}>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '1.125rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-outline)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@linguaschool.com"
                  required
                  className="input-field"
                  style={{ paddingLeft: '2.75rem' }}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '1.125rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-outline)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field"
                  style={{ paddingLeft: '2.75rem' }}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mb-5 flex items-start gap-2 rounded-2xl p-3"
                style={{ background: 'var(--color-error-container)' }}
              >
                <AlertCircle size={16} style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--color-on-error-container)', fontWeight: 600 }}>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
              style={{ padding: '0.875rem', fontSize: '1rem' }}
            >
              {loading ? (
                <div
                  className="rounded-full animate-spin"
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white',
                  }}
                />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: 'var(--color-outline)',
            marginTop: '1.5rem',
          }}
        >
          Accessible to administrators only
        </p>
      </div>
    </div>
  )
}
