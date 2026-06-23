import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Award, TrendingUp, Clock, Zap, Star } from 'lucide-react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import EventCard from '../../components/EventCard';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ registrations: 0, attended: 0, certificates: 0, points: 0 });
  const [recommended, setRecommended] = useState([]);
  const [recentRegs, setRecentRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regRes, certRes, eventsRes] = await Promise.all([
          api.get('/registrations/my'),
          api.get('/certificates/my'),
          api.get(`/events?status=published&limit=6&sort=-createdAt${user?.interests?.length ? '&interests=' + user.interests.slice(0, 5).join(',') : ''}`),
        ]);

        const regs = regRes.data.registrations || [];
        const certs = certRes.data.certificates || [];
        const attended = regs.filter((r) => r.status === 'attended').length;

        setStats({ registrations: regs.length, attended, certificates: certs.length, points: user?.achievementPoints || attended * 10 });
        setRecentRegs(regs.slice(0, 3));
        setRecommended(eventsRes.data.events || []);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const statCards = [
    { icon: Calendar, label: 'Registered', value: stats.registrations, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
    { icon: TrendingUp, label: 'Attended', value: stats.attended, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    { icon: Award, label: 'Certificates', value: stats.certificates, color: '#4ade80', bg: 'rgba(34,197,94,0.12)' },
    { icon: Star, label: 'Points', value: stats.points, color: '#fbbf24', bg: 'rgba(234,179,8,0.12)' },
  ];

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  return (
    <div>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          {user?.institution ? `${user.institution} · ` : ''}{user?.department} {user?.year ? `· ${user.year}` : ''}
        </p>
      </motion.div>

      {/* Interests */}
      {user?.interests?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {user.interests.slice(0, 8).map((i) => (
            <span key={i} className="badge badge-purple" style={{ fontSize: '0.75rem' }}>{i}</span>
          ))}
          {user.interests.length > 8 && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>+{user.interests.length - 8} more</span>}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {statCards.map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem' }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#e2e8f0', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>{label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        {/* Recommended events */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={18} style={{ color: '#fbbf24' }} /> Recommended for You
            </h2>
            <Link to="/events" style={{ fontSize: '0.82rem', color: '#a78bfa', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recommended.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {recommended.slice(0, 4).map((event) => <EventCard key={event._id} event={event} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#64748b' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
              <p style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#94a3b8' }}>No events yet</p>
              <Link to="/events" className="btn-primary" style={{ display: 'inline-flex', marginTop: '0.75rem', fontSize: '0.85rem' }}>Browse Events</Link>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Recent registrations */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>Recent Registrations</h3>
              <Link to="/student/registrations" style={{ fontSize: '0.78rem', color: '#a78bfa', textDecoration: 'none' }}>See all</Link>
            </div>
            {recentRegs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentRegs.map((reg) => (
                  <div key={reg._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed20, #06b6d420)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem' }}>📅</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reg.event?.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                        {reg.event?.startDate ? format(new Date(reg.event.startDate), 'MMM dd') : 'TBD'}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: 4,
                      background: reg.status === 'attended' ? 'rgba(124,58,237,0.2)' : 'rgba(34,197,94,0.15)',
                      color: reg.status === 'attended' ? '#c4b5fd' : '#4ade80',
                    }}>{reg.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.83rem', color: '#64748b', textAlign: 'center', padding: '1rem' }}>No registrations yet</p>
            )}
          </div>

          {/* Quick links */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.75rem' }}>Quick Links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: '🎓 My Portfolio', to: '/student/portfolio' },
                { label: '📋 My Registrations', to: '/student/registrations' },
                { label: '🔍 Browse Events', to: '/events' },
                { label: '🎪 Become Organizer', to: '/become-organizer' },
              ].map(({ label, to }) => (
                <Link key={to} to={to} style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'none', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)', transition: 'all 0.15s', display: 'block' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                >{label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
