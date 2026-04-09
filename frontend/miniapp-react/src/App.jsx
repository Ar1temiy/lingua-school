import { useState, useCallback } from 'react'
import HomeScreen from './screens/HomeScreen'
import BookingScreen from './screens/BookingScreen'
import ProfileScreen from './screens/ProfileScreen'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import { useAuth } from './context/AuthContext'
import { BookingsProvider } from './context/BookingsContext'

function App() {
  const [activeTab, setActiveTab] = useState('Home')
  const [toast, setToast] = useState(null)
  const { loading, error } = useAuth()

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#dde1e8' }}>
        <div className="max-w-md w-full relative flex flex-col items-center justify-center overflow-hidden gap-4"
             style={{ height: 'max(884px, 100dvh)', background: 'var(--color-background)', borderRadius: 'clamp(0px, (100vw - 480px) * 999, 2.5rem)', boxShadow: '0 32px 80px rgba(57, 75, 175, 0.12)' }}>
          <div className="w-10 h-10 border-4 border-t-transparent border-[var(--color-primary)] rounded-full animate-spin"></div>
          <p className="font-bold text-[var(--color-on-surface-variant)]">Синхронизация профиля...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#dde1e8' }}>
        <div className="max-w-md w-full relative flex flex-col items-center justify-center overflow-hidden gap-4 px-6 text-center"
             style={{ height: 'max(884px, 100dvh)', background: 'var(--color-background)', borderRadius: 'clamp(0px, (100vw - 480px) * 999, 2.5rem)', boxShadow: '0 32px 80px rgba(57, 75, 175, 0.12)' }}>
          <span className="material-symbols-outlined text-4xl" style={{ color: 'var(--color-error)' }}>error</span>
          <p className="font-bold text-[var(--color-on-surface)]">Ошибка авторизации</p>
          <p className="text-sm text-[var(--color-on-surface-variant)]">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <BookingsProvider>
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#dde1e8' }}>
      <div
        className="max-w-md w-full relative flex flex-col overflow-hidden"
        style={{
          height: 'max(884px, 100dvh)',
          background: 'var(--color-background)',
          borderRadius: 'clamp(0px, (100vw - 480px) * 999, 2.5rem)',
          boxShadow: '0 32px 80px rgba(57, 75, 175, 0.12), 0 8px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* ── Top App Bar ── */}
        <header
          className="absolute top-0 left-0 w-full z-50 glass-nav"
          style={{
            boxShadow: '0 1px 0 rgba(57,75,175,0.06)',
          }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #394baf 0%, #5365c9 100%)' }}
              >
                <span className="material-symbols-outlined filled text-white" style={{ fontSize: '1.1rem' }}>
                  school
                </span>
              </div>
              <span
                className="text-lg font-extrabold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #394baf 0%, #5365c9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Lingua School
              </span>
            </div>

            {/* Notification Bell */}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-90"
              style={{
                background: 'var(--color-surface-container-low)',
                color: 'var(--color-on-surface-variant)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>notifications</span>
            </button>
          </div>
        </header>

        {/* ── Screen Content ── */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'Home'    && <HomeScreen    setActiveTab={setActiveTab} showToast={showToast} />}
          {activeTab === 'Booking' && <BookingScreen setActiveTab={setActiveTab} showToast={showToast} />}
          {activeTab === 'Profile' && <ProfileScreen setActiveTab={setActiveTab} showToast={showToast} />}
        </div>

        {/* ── Bottom Navigation ── */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* ── Toast ── */}
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  </BookingsProvider>
  )
}

export default App
