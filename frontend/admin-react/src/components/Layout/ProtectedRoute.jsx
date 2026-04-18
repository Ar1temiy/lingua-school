import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: 'var(--color-background)' }}>
        <div
          className="rounded-full animate-spin"
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--color-surface-container-high)',
            borderTopColor: 'var(--color-primary)',
          }}
        />
      </div>
    )
  }

  if (!admin) {
    return <Navigate to="/login" replace />
  }

  return children
}
