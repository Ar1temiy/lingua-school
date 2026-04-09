import React, { useEffect, useState } from 'react'
import { format, addDays, startOfDay, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useLessons } from '../hooks/useLessons'
import { useBookings } from '../context/BookingsContext'

/* ─── Skeleton ─── */
function SlotSkeleton() {
  return (
    <div className="card animate-pulse" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div>
        <div className="skeleton h-3 w-14 rounded mb-2" />
        <div className="skeleton h-7 w-16 rounded" />
      </div>
      <div className="flex-1">
        <div className="skeleton h-3 w-24 rounded mb-2" />
        <div className="progress-track" style={{ background: 'var(--color-surface-container-high)' }} />
      </div>
      <div className="skeleton h-8 w-16 rounded-full" />
    </div>
  )
}

/* ─── Teacher Card ─── */
function TeacherCard({ teacher, isSelected, onClick }) {
  const initials = `${teacher.first_name?.[0] || ''}${teacher.last_name?.[0] || ''}`.toUpperCase()
  const colors = [
    ['#e8ecff', '#394baf'],
    ['#fff3e0', '#e65100'],
    ['#e8f5e9', '#2e7d32'],
    ['#fce4ec', '#c62828'],
    ['#ede7f6', '#4527a0'],
  ]
  const [bg, fg] = colors[teacher.id % colors.length] || colors[0]

  return (
    <button
      onClick={onClick}
      style={{
        minWidth: '130px',
        maxWidth: '130px',
        flexShrink: 0,
        background: isSelected ? 'var(--color-surface-container-lowest)' : 'var(--color-surface-container-lowest)',
        borderRadius: 'var(--radius-xl)',
        padding: '1rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        border: `2px solid ${isSelected ? 'var(--color-primary)' : 'transparent'}`,
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isSelected
          ? '0 4px 20px rgba(57,75,175,0.15)'
          : '0 1px 8px rgba(0,0,0,0.04)',
        position: 'relative',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '9999px',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          fontWeight: 800,
          color: fg,
        }}
      >
        {initials}
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: 'var(--color-on-surface)',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100px'
        }}>
          {teacher.first_name} {teacher.last_name?.[0]}.
        </p>
        <p style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>
          Teacher
        </p>
      </div>

      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 16,
            height: 16,
            borderRadius: '9999px',
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="material-symbols-outlined filled" style={{ fontSize: '0.65rem', color: '#fff' }}>check</span>
        </div>
      )}
    </button>
  )
}


/* ─── Slot Card (New Premium Design) ─── */
function SlotCard({ lesson, onBook, isBooking }) {
  const hasSpace = lesson.available_slots > 0
  const isIndividual = lesson.type === 'individual'
  
  return (
    <div
      style={{
        background: 'var(--color-surface-container-lowest)',
        borderRadius: 'var(--radius-xl)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: '0 1px 6px rgba(0,0,0,0.02)',
        border: '1px solid var(--color-outline-variant)',
        opacity: hasSpace ? 1 : 0.6,
      }}
    >
      {/* Time & Type Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ 
            display: 'block', 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            color: 'var(--color-on-surface)',
            lineHeight: 1
          }}>
            {format(new Date(lesson.start_time), 'HH:mm')}
          </span>
          <span style={{ 
            fontSize: '0.625rem', 
            fontWeight: 700, 
            color: 'var(--color-outline)',
            textTransform: 'uppercase',
            marginTop: 4,
            display: 'block'
          }}>
            {format(new Date(lesson.end_time), 'HH:mm')}
          </span>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--color-outline-variant)' }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>
              {isIndividual ? 'person' : 'group'}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>
              {isIndividual ? 'Индивидуально' : 'Групповое'}
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>
               {lesson.teacher_name}
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
               {lesson.language_name}
            </span>
          </div>

          <p style={{ 
            fontSize: '0.6875rem', 
            color: hasSpace ? 'var(--color-primary)' : 'var(--color-error)',
            fontWeight: 700,
            marginTop: 4
          }}>
            {hasSpace ? `Свободно: ${lesson.available_slots} из ${lesson.capacity}` : 'Мест нет'}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onBook(lesson.id)}
        disabled={!hasSpace || isBooking}
        className={hasSpace ? 'btn-primary' : ''}
        style={{
          padding: '0.625rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          fontSize: '0.8125rem',
          fontWeight: 800,
          minWidth: '100px',
          transition: 'all 0.2s ease',
          ...(hasSpace ? {
             boxShadow: '0 4px 12px rgba(57,75,175,0.2)'
          } : {
            background: 'var(--color-surface-container-high)',
            color: 'var(--color-outline)',
            cursor: 'not-allowed',
            border: 'none'
          })
        }}
      >
        {isBooking ? '...' : (hasSpace ? 'Записаться' : 'Занято')}
      </button>
    </div>
  )
}

/* ─── Section Header ─── */
function SectionHeader({ title, step }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: '0.875rem' }}>
      <h2
        style={{
          fontSize: '1.0625rem',
          fontWeight: 700,
          color: 'var(--color-on-surface)',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      <span
        style={{
          fontSize: '0.5625rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--color-primary)',
          background: 'rgba(57,75,175,0.08)',
          padding: '0.25rem 0.625rem',
          borderRadius: '9999px',
        }}
      >
        {step}
      </span>
    </div>
  )
}

/* ─── Main Screen ─── */
export default function BookingScreen({ showToast }) {
  const { languages, staff, lessons, loading, fetchLanguages, fetchStaff, fetchAvailableLessons } = useLessons()
  const { createBooking, loading: bookingLoading } = useBookings()

  const [selectedLanguage, setSelectedLanguage] = useState(null)
  const [selectedTeacher, setSelectedTeacher] = useState(null)

  // Logic to group lessons by day
  const groupedLessons = lessons.reduce((acc, lesson) => {
    const dateKey = format(new Date(lesson.start_time), 'yyyy-MM-dd')
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(lesson)
    return acc
  }, {})

  useEffect(() => {
    fetchLanguages()
    fetchStaff()
    // Initially load all lessons to show something, or wait for selection
    fetchAvailableLessons({})
  }, [fetchLanguages, fetchStaff, fetchAvailableLessons])

  // Handle sequential filtering
  useEffect(() => {
    if (selectedLanguage || selectedTeacher) {
      fetchAvailableLessons({
        language_id: selectedLanguage,
        teacher_id: selectedTeacher,
      })
    }
  }, [selectedLanguage, selectedTeacher, fetchAvailableLessons])

  const handleLanguageChange = (langId) => {
    const newValue = langId === selectedLanguage ? null : langId
    setSelectedLanguage(newValue)
    setSelectedTeacher(null) // Reset teacher when language changes
  }

  // Filter staff based on selected language
  const filteredStaff = selectedLanguage
    ? staff.filter(t => t.languages?.some(l => l.id === selectedLanguage))
    : staff

  const handleBook = async (lessonId) => {
    try {
      await createBooking(lessonId)
      showToast?.('Вы успешно записаны! 🎉')
      fetchAvailableLessons({ language_id: selectedLanguage, teacher_id: selectedTeacher })
    } catch (err) {
      showToast?.(err?.response?.data?.detail || 'Ошибка при записи', 'error')
    }
  }

  return (
    <main
      className="hide-scrollbar"
      style={{
        height: '100%',
        overflowY: 'auto',
        paddingTop: '5.5rem',
        paddingBottom: '1rem',
        paddingLeft: '1.25rem',
        paddingRight: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}
    >
      {/* ── Page Title ── */}
      <section className="animate-fade-in-up" style={{ paddingTop: '0.5rem' }}>
        <h1
          style={{
            fontSize: '1.875rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--color-on-surface)',
            lineHeight: 1.15,
          }}
        >
          Reserve a Class
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>
          Выберите язык, преподавателя и время
        </p>
      </section>

      {/* ── Step 1: Language ── */}
      <section className="animate-fade-in-up delay-50">
        <SectionHeader title="Choose Language" step="ШАГ 01" />
        <div className="hide-scrollbar" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: 4 }}>
          {languages.length === 0 && (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ minWidth: 90, height: 38, borderRadius: '9999px' }} />
              ))}
            </>
          )}
          {languages.map(lang => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`chip ${selectedLanguage === lang.id ? 'chip-selected' : 'chip-default'}`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── Step 2: Teacher ── */}
      <section 
        className="animate-fade-in-up delay-100" 
        style={{ 
          opacity: selectedLanguage ? 1 : 0.4, 
          transition: 'opacity 0.3s ease',
          pointerEvents: selectedLanguage ? 'auto' : 'none'
        }}
      >
        <SectionHeader title="Select Teacher" step="ШАГ 02" />
        <div
          className="hide-scrollbar"
          style={{
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem'
          }}
        >
          {staff.length === 0 && (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ minWidth: 130, height: 120, borderRadius: 'var(--radius-xl)' }} />
              ))}
            </>
          )}
          {filteredStaff.map(teacher => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              isSelected={selectedTeacher === teacher.id}
              onClick={() => setSelectedTeacher(teacher.id === selectedTeacher ? null : teacher.id)}
            />
          ))}
          {!loading && filteredStaff.length === 0 && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-outline)', padding: '1rem 0' }}>
              Нет преподавателей для этого языка
            </p>
          )}
        </div>
      </section>

      {/* ── Step 3: Available Slots ── */}
      <section 
        className="animate-fade-in-up delay-150"
        style={{ 
          opacity: selectedTeacher ? 1 : 0.4, 
          transition: 'opacity 0.3s ease'
        }}
      >
        <SectionHeader title="Available Slots" step="ШАГ 03" />

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <SlotSkeleton />
            <SlotSkeleton />
            <SlotSkeleton />
          </div>
        )}

        {!loading && lessons.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              background: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '2.5rem', color: 'var(--color-outline)', display: 'block', marginBottom: '0.75rem' }}
            >
              event_busy
            </span>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
              Нет доступных слотов
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-outline)', marginTop: '0.25rem' }}>
              Выберите другого преподавателя или язык
            </p>
          </div>
        )}

        {!loading && Object.keys(groupedLessons).sort().map(dateKey => (
          <div key={dateKey} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ 
              fontSize: '0.75rem', 
              fontWeight: 800, 
              color: 'var(--color-outline)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>calendar_today</span>
              {format(new Date(dateKey), 'd MMMM, EEEE', { locale: ru })}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {groupedLessons[dateKey].map(lesson => (
                <SlotCard
                  key={lesson.id}
                  lesson={lesson}
                  onBook={handleBook}
                  isBooking={bookingLoading}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Bottom spacer */}
      <div style={{ height: '0.5rem' }} />
    </main>
  )
}
