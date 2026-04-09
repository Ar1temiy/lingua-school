import React from 'react'

const TABS = [
  { id: 'Home',    icon: 'home',           label: 'Главная' },
  { id: 'Booking', icon: 'calendar_month', label: 'Запись' },
  { id: 'Profile', icon: 'person',         label: 'Профиль' },
]

/**
 * BottomNav — glassmorphic bottom navigation bar.
 * Matches "The Ethereal Academy" design: full rounded pill indicator,
 * indigo accent, backdrop-blur glass effect.
 */
export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav
      className="glass-nav"
      style={{
        borderTop: '1px solid rgba(57,75,175,0.06)',
        boxShadow: '0 -4px 24px rgba(57, 75, 175, 0.06)',
        flexShrink: 0,
      }}
    >
      <div className="flex justify-around items-center px-2 pt-3 pb-6">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              id={`nav-${tab.id.toLowerCase()}`}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-pill ${isActive ? 'active' : 'inactive'}`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}
                style={{
                  fontSize: '1.5rem',
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  transition: 'font-variation-settings 0.2s ease',
                }}
              >
                {tab.icon}
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  transition: 'color 0.2s ease',
                }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
