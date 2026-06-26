import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BarChart2, QrCode, Eye, Trash2, Edit, Users, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const statusConfig = {
  draft: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', label: 'Draft' },
  published: { color: '#4ade80', bg: 'rgba(34,197,94,0.12)', label: 'Published' },
  completed: { color: '#a78bfa', bg: 'rgba(124,58,237,0.12)', label: 'Completed' },
  cancelled: { color: '#f87171', bg: 'rgba(239,68,68,0.12)', label: 'Cancelled' },
  pending: { color: '#fbbf24', bg: 'rgba(234,179,8,0.12)', label: 'Pending' },
};

export default function OrganizerDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const { data } = await api.get('/analytics/organizer/summary');
      setSummary(data.summary);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchSummary(); }, []);

  const handlePublish = async (eventId) => {
    try {
      await api.patch(`/events/${eventId}/publish`);
      toast.success('Event published!');
      fetchSummary();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      toast.success('Event deleted');
      fetchSummary();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  const s = summary || {};

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>Organizer Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage your events and track performance</p>
        </div>
        <Link to="/organizer/events/new" className="btn-primary">
          <Plus size={17} /> Create Event
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Events', value: s.totalEvents || 0, color: '#7c3aed', icon: '📅' },
          { label: 'Published', value: s.publishedEvents || 0, color: '#4ade80', icon: '✅' },
          { label: 'Registrations', value: s.totalRegistrations || 0, color: '#06b6d4', icon: '👥' },
          { label: 'Attended', value: s.totalAttended || 0, color: '#fbbf24', icon: '🎯' },
          { label: 'Certificates', value: s.totalCertificates || 0, color: '#f472b6', icon: '🏆' },
        ].map(({ label, value, color, icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{icon}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#e2e8f0' }}>{value}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Events table */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>Your Events</h2>
        </div>

        {(!s.events || s.events.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
            <p style={{ fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>No events yet</p>
            <Link to="/organizer/events/new" className="btn-primary" style={{ display: 'inline-flex', fontSize: '0.85rem' }}>
              <Plus size={15} /> Create your first event
            </Link>
          </div>
        ) : (
          <div>
            {s.events.map((event) => {
              const sc = statusConfig[event.status] || statusConfig.draft;
              const fillPct = event.capacity > 0 ? Math.round((event.registeredCount / event.capacity) * 100) : 0;
              return (
                <div key={event._id} style={{
                  display: 'flex', gap: '1rem', padding: '1.1rem 1.5rem', alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem', marginBottom: 4 }}>{event.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span>{event.category}</span>
                      {event.startDate && <span>{format(new Date(event.startDate), 'MMM dd, yyyy')}</span>}
                    </div>
                  </div>

                  {/* Registrations */}
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>{event.registeredCount}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>/{event.capacity}</div>
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', marginTop: 4 }}>
                      <div style={{ height: '100%', borderRadius: 2, background: '#7c3aed', width: `${Math.min(fillPct, 100)}%` }} />
                    </div>
                  </div>

                  {/* Status */}
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: sc.bg, color: sc.color, flexShrink: 0 }}>
                    {sc.label}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    {event.status === 'draft' && (
                      <button onClick={() => handlePublish(event._id)} style={{ padding: '0.4rem 0.75rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.75rem', background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={13} /> Publish
                      </button>
                    )}
                    {(event.status === 'published' || event.status === 'ongoing') && (
                      <Link to={`/organizer/events/${event._id}/scan`} style={{ padding: '0.4rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.75rem', background: 'rgba(6,182,212,0.15)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <QrCode size={13} /> Scan
                      </Link>
                    )}
                    <Link to={`/organizer/events/${event._id}/participants`} style={{ padding: '0.4rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.75rem', background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }} title="View Participants">
                      <Users size={13} /> Participants
                    </Link>
                    <Link to={`/organizer/events/${event._id}/analytics`} style={{ padding: '0.4rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.75rem', background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <BarChart2 size={13} /> Stats
                    </Link>
                    <Link to={`/organizer/events/${event._id}/edit`} style={{ padding: '0.4rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Edit size={13} />
                    </Link>
                    <button onClick={() => handleDelete(event._id)} style={{ padding: '0.4rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
