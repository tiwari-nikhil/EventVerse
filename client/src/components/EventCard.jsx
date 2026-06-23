import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

const categoryColors = {
  hackathon: 'cat-hackathon', workshop: 'cat-workshop', seminar: 'cat-seminar',
  webinar: 'cat-webinar', competition: 'cat-competition', cultural: 'cat-cultural',
  sports: 'cat-sports', volunteer: 'cat-volunteer', networking: 'cat-networking', other: 'cat-other'
};

const modeColors = {
  online: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', label: '🌐 Online' },
  offline: { bg: 'rgba(249,115,22,0.12)', color: '#fb923c', label: '📍 Offline' },
  hybrid: { bg: 'rgba(168,85,247,0.12)', color: '#c084fc', label: '⚡ Hybrid' },
};

export default function EventCard({ event, showOrganizer = true }) {
  const categoryClass = categoryColors[event.category] || 'cat-other';
  const modeStyle = modeColors[event.mode] || modeColors.offline;
  const fillPercent = event.capacity > 0 ? Math.round((event.registeredCount / event.capacity) * 100) : 0;
  const isFull = fillPercent >= 100;

  return (
    <Link to={`/events/${event._id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        height: '100%',
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(124,58,237,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Banner */}
        <div style={{
          height: 160, position: 'relative', overflow: 'hidden',
          background: event.banner
            ? `url(${event.banner}) center/cover`
            : 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1a1a2e 100%)',
        }}>
          {!event.banner && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem', opacity: 0.3,
            }}>
              {event.category === 'hackathon' ? '💻' : event.category === 'workshop' ? '🔧' :
               event.category === 'cultural' ? '🎭' : event.category === 'sports' ? '⚽' :
               event.category === 'seminar' ? '🎤' : '📅'}
            </div>
          )}

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
            background: 'linear-gradient(transparent, rgba(15,15,26,0.8))',
          }} />

          {/* Badges */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
            <span className={`badge ${categoryClass}`} style={{ fontSize: '0.72rem' }}>
              {event.category}
            </span>
          </div>

          <div style={{
            position: 'absolute', top: 12, right: 12,
            padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
            background: modeStyle.bg, color: modeStyle.color,
          }}>
            {modeStyle.label}
          </div>

          {event.isFeatured && (
            <div style={{
              position: 'absolute', bottom: 12, left: 12,
              padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
              background: 'rgba(234,179,8,0.2)', color: '#facc15',
              border: '1px solid rgba(234,179,8,0.3)',
            }}>⭐ Featured</div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '1.1rem' }}>
          <h3 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0',
            marginBottom: '0.5rem', lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {event.title}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
            <div className="flex items-center gap-2" style={{ fontSize: '0.78rem', color: '#64748b' }}>
              <Calendar size={13} />
              <span>{event.startDate ? format(new Date(event.startDate), 'MMM dd, yyyy') : 'TBD'}</span>
            </div>
            {(event.venue || event.mode === 'online') && (
              <div className="flex items-center gap-2" style={{ fontSize: '0.78rem', color: '#64748b' }}>
                <MapPin size={13} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {event.mode === 'online' ? 'Online Event' : event.venue}
                </span>
              </div>
            )}
          </div>

          {/* Organizer */}
          {showOrganizer && event.organizer && (
            <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700, color: 'white',
              }}>
                {event.organizer?.name?.[0] || 'O'}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {event.organizer?.name || event.organization?.name || 'Organizer'}
              </span>
            </div>
          )}

          {/* Capacity bar */}
          <div>
            <div className="flex items-center justify-between" style={{ fontSize: '0.73rem', color: '#64748b', marginBottom: 4 }}>
              <span className="flex items-center gap-1"><Users size={12} /> {event.registeredCount} registered</span>
              <span style={{ color: isFull ? '#f87171' : '#94a3b8' }}>{isFull ? 'Full' : `${event.capacity - event.registeredCount} left`}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: isFull ? '#ef4444' : fillPercent > 70 ? '#f59e0b' : '#7c3aed',
                width: `${Math.min(fillPercent, 100)}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
