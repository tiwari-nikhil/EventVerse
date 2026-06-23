import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Tag, ExternalLink, Share2, Download } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const categoryColors = {
  hackathon: 'cat-hackathon', workshop: 'cat-workshop', seminar: 'cat-seminar',
  webinar: 'cat-webinar', competition: 'cat-competition', cultural: 'cat-cultural',
  sports: 'cat-sports', volunteer: 'cat-volunteer', networking: 'cat-networking', other: 'cat-other'
};

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data.event);
        // Check if already registered
        if (token) {
          try {
            const { data: regs } = await api.get('/registrations/my');
            const found = regs.registrations?.find((r) => r.event?._id === id || r.event === id);
            if (found) setRegistered(true);
          } catch {}
        }
      } catch {
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!token) { navigate('/login'); return; }
    setRegistering(true);
    try {
      const { data } = await api.post('/registrations', { eventId: id });
      setRegistered(true);
      toast.success('Registered successfully! Check your QR pass 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  if (!event) return null;

  const fillPercent = event.capacity > 0 ? Math.round((event.registeredCount / event.capacity) * 100) : 0;
  const isFull = event.registeredCount >= event.capacity;
  const isPast = new Date(event.startDate) < new Date();

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a' }}>
      {/* Nav */}
      <nav style={{ padding: '1rem 5%', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={() => navigate('/events')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.4rem 1rem', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>
          ← Back to Events
        </button>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 5%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Banner */}
            <div style={{
              height: 300, borderRadius: '1.25rem', marginBottom: '2rem', overflow: 'hidden',
              background: event.banner
                ? `url(${event.banner}) center/cover`
                : 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {!event.banner && <span style={{ fontSize: '5rem', opacity: 0.3 }}>📅</span>}
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span className={`badge ${categoryColors[event.category] || 'cat-other'}`}>{event.category}</span>
              <span className="badge" style={{ background: 'rgba(6,182,212,0.12)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.3)' }}>{event.mode}</span>
              {event.status === 'published' && <span className="badge badge-green">Open</span>}
              {event.status === 'completed' && <span className="badge badge-purple">Completed</span>}
            </div>

            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '1rem', lineHeight: 1.2 }}>
              {event.title}
            </h1>

            {/* Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
              {[
                { icon: Calendar, label: 'Start', value: format(new Date(event.startDate), 'EEE, MMM dd yyyy • h:mm a') },
                { icon: Calendar, label: 'End', value: format(new Date(event.endDate), 'EEE, MMM dd yyyy • h:mm a') },
                { icon: MapPin, label: 'Venue', value: event.mode === 'online' ? 'Online Event' : (event.venue || 'TBD') },
                { icon: Users, label: 'Capacity', value: `${event.registeredCount} / ${event.capacity} registered` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '0.75rem', padding: '0.9rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Icon size={18} style={{ color: '#7c3aed', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.75rem' }}>About This Event</h2>
              <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{event.description}</p>
            </div>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.75rem' }}>Tags</h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {event.tags.map((tag) => (
                    <span key={tag} className="badge badge-purple" style={{ fontSize: '0.78rem' }}>
                      <Tag size={11} />{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Organizer */}
            {event.organizer && (
              <div style={{ padding: '1.25rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.75rem' }}>Organized by</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>
                    {event.organizer?.name?.[0] || 'O'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>{event.organizer?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{event.organizer?.institution || 'Organizer'}</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right - registration card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ position: 'sticky', top: '2rem' }}
          >
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '1rem' }}>
              {/* Fill rate */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b', marginBottom: 8 }}>
                  <span>{event.registeredCount} registered</span>
                  <span style={{ color: isFull ? '#f87171' : '#94a3b8' }}>{isFull ? 'Full!' : `${event.capacity - event.registeredCount} spots left`}</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    background: isFull ? '#ef4444' : fillPercent > 70 ? '#f59e0b' : 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                    width: `${Math.min(fillPercent, 100)}%`, transition: 'width 0.5s',
                  }} />
                </div>
              </div>

              {registered ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
                  <div style={{ fontWeight: 700, color: '#4ade80', fontSize: '0.95rem', marginBottom: 8 }}>You're registered!</div>
                  <button onClick={() => navigate('/student/registrations')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}>
                    View QR Pass
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleRegister}
                    className="btn-primary"
                    disabled={registering || isFull || isPast || event.status !== 'published'}
                    style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '0.95rem', marginBottom: '0.75rem', opacity: (isFull || isPast || event.status !== 'published') ? 0.5 : 1 }}
                  >
                    {registering ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                      : isFull ? 'Event Full' : isPast ? 'Event Passed' : 'Register Now →'}
                  </button>
                  {event.registrationDeadline && (
                    <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                      Registration closes {format(new Date(event.registrationDeadline), 'MMM dd, yyyy')}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Quick info */}
            {event.prizes?.length > 0 && (
              <div style={{ padding: '1.25rem', borderRadius: '1rem', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem' }}>🏆 Prizes</h3>
                <ul style={{ paddingLeft: '1rem', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 2 }}>
                  {event.prizes.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
