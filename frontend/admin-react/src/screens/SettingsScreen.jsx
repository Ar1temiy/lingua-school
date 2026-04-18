import { Settings, Shield, Globe, Bell, Database } from 'lucide-react'

function SettingSection({ icon: Icon, title, description, children }) {
  return (
    <div className="card animate-fade-in-up" style={{ boxShadow: '0 2px 12px rgba(25,28,30,0.06)', marginBottom: '1.5rem' }}>
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{ width: '40px', height: '40px', background: 'rgba(57,75,175,0.08)' }}
        >
          <Icon size={18} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-on-surface)' }}>{title}</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function SettingsScreen() {
  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '800px' }}>
      <div className="mb-8 animate-fade-in">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
          System configuration and preferences
        </p>
      </div>

      <SettingSection icon={Globe} title="Regional Settings" description="Manage availability and holiday schedules">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>
              Timezone
            </label>
            <select className="input-field">
              <option>Europe/London (GMT+0)</option>
              <option>Europe/Paris (GMT+1)</option>
              <option>America/New_York (GMT-5)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', marginBottom: '0.5rem' }}>
              Region
            </label>
            <select className="input-field">
              <option>EU-West</option>
              <option>US-East</option>
              <option>AS-Pacific</option>
            </select>
          </div>
        </div>
        <button className="btn-primary mt-4" style={{ marginTop: '1rem' }}>Save Regional Settings</button>
      </SettingSection>

      <SettingSection icon={Shield} title="Security" description="Access control and authentication settings">
        <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'var(--color-surface-container-low)', marginBottom: '0.75rem' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-on-surface)' }}>Admin access only</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>Restrict this panel to admin-role users</p>
          </div>
          <div
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #394baf 0%, #5365c9 100%)',
              display: 'flex',
              alignItems: 'center',
              padding: '2px 2px 2px 22px',
              cursor: 'pointer',
            }}
          >
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white' }} />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'var(--color-surface-container-low)' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-on-surface)' }}>Require 2FA</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>Two-factor authentication for admin login</p>
          </div>
          <div
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '9999px',
              background: 'var(--color-surface-container-highest)',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              cursor: 'pointer',
            }}
          >
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </div>
        </div>
      </SettingSection>

      <SettingSection icon={Bell} title="Notifications" description="Email alerts and system notifications">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {['New booking notifications', 'Cancellation alerts', 'Weekly summary report'].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'var(--color-surface-container-low)' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-on-surface)' }}>{item}</p>
              <div
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '9999px',
                  background: i !== 2 ? 'linear-gradient(135deg, #394baf 0%, #5365c9 100%)' : 'var(--color-surface-container-highest)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: i !== 2 ? '2px 2px 2px 22px' : '2px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          ))}
        </div>
      </SettingSection>

      <SettingSection icon={Database} title="System Info" description="Backend connection and version details">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'API Version', value: 'v1.0.0' },
            { label: 'Panel Version', value: 'v2.4.0-stable' },
            { label: 'Region', value: 'EU-West' },
            { label: 'Backend', value: 'FastAPI / PostgreSQL' },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-2xl" style={{ background: 'var(--color-surface-container-low)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                {label}
              </p>
              <p style={{ fontWeight: 700, color: 'var(--color-on-surface)', fontSize: '0.9375rem' }}>{value}</p>
            </div>
          ))}
        </div>
      </SettingSection>
    </div>
  )
}
