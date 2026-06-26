import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, Search, Download, CheckCircle, XCircle,
  Clock, Mail, Building, GraduationCap, Calendar, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const statusConfig = {
  registered: { label: 'Registered', color: '#4ade80', bg: 'rgba(34,197,94,0.12)', icon: Clock },
  attended:   { label: 'Attended',   color: '#a78bfa', bg: 'rgba(124,58,237,0.12)', icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: '#f87171', bg: 'rgba(239,68,68,0.12)',  icon: XCircle },
  waitlisted: { label: 'Waitlisted', color: '#fbbf24', bg: 'rgba(234,179,8,0.12)',  icon: Clock },
};

const Avatar = ({ name, avatar, size = 36 }) => {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
  const color = colors[name?.charCodeAt(0) % colors.length] || '#7c3aed';
  if (avatar) return (
    <img src={avatar} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: `${color}22`,
      border: `2px solid ${color}44`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700,
      color, flexShrink: 0, fontFamily: "'Space Grotesk', sans-serif",
    }}>
      {initials}
    </div>
  );
};

export default function EventParticipantsPage() {
  const { id } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partRes, evtRes] = await Promise.all([
          api.get(`/events/${id}/participants`),
          api.get(`/events/${id}`),
        ]);
        setRegistrations(partRes.data.registrations || []);
        setEvent(evtRes.data.event);
      } catch (err) {
        toast.error('Failed to load participants');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const filtered = registrations.filter(r => {
    const matchSearch =
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.institution?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const stats = {
    total: registrations.length,
    attended: registrations.filter(r => r.status === 'attended').length,
    registered: registrations.filter(r => r.status === 'registered').length,
    cancelled: registrations.filter(r => r.status === 'cancelled').length,
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Institution', 'Department', 'Year', 'Status', 'Registered At'];
    const rows = filtered.map(r => [
      r.user?.name || '',
      r.user?.email || '',
      r.user?.institution || '',
      r.user?.department || '',
      r.user?.year || '',
      r.status || '',
      r.registeredAt ? format(new Date(r.registeredAt), 'yyyy-MM-dd HH:mm') : '',
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants_${event?.title?.replace(/\s+/g, '_') || id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <Link
          to="/organizer/dashboard"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1rem' }}
        >
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>
              Participants
            </h1>
            {event && (
              <p style={{ color: '#64748b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={13} />
                {event.title} &nbsp;·&nbsp;
                {event.startDate && format(new Date(event.startDate), 'MMM dd, yyyy')}
              </p>
            )}
          </div>

          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '0.55rem 1.1rem',
              borderRadius: '0.6rem', background: 'rgba(124,58,237,0.15)', color: '#a78bfa',
              border: '1px solid rgba(124,58,237,0.3)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: stats.total, color: '#e2e8f0', icon: '👥' },
          { label: 'Registered', value: stats.registered, color: '#4ade80', icon: '✅' },
          { label: 'Attended', value: stats.attended, color: '#a78bfa', icon: '🎯' },
          { label: 'Cancelled', value: stats.cancelled, color: '#f87171', icon: '❌' },
        ].map(({ label, value, color, icon }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.85rem', padding: '1rem 1.25rem',
            }}
          >
            <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{icon}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.6rem', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by name, email, institution..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.6rem 0.9rem 0.6rem 2.25rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.6rem', color: '#e2e8f0', fontSize: '0.875rem', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['all', 'registered', 'attended', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '0.5rem 0.9rem', borderRadius: '0.5rem', fontSize: '0.78rem', fontWeight: 600,
                cursor: 'pointer', border: '1px solid',
                background: filterStatus === s ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                borderColor: filterStatus === s ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)',
                color: filterStatus === s ? '#a78bfa' : '#64748b',
                transition: 'all 0.15s',
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Participants list */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', overflow: 'hidden' }}>
        <div className="overflow-x-auto w-full">
          <div style={{ minWidth: 800 }}>
            {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 1fr',
          padding: '0.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)',
          fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          <span>Participant</span>
          <span>Institution</span>
          <span>Dept / Year</span>
          <span>Registered</span>
          <span>Status</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
              {search || filterStatus !== 'all' ? '🔍' : '👥'}
            </div>
            <p style={{ fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>
              {search || filterStatus !== 'all' ? 'No participants match your filters' : 'No registrations yet'}
            </p>
            <p style={{ fontSize: '0.82rem' }}>
              {search || filterStatus !== 'all' ? 'Try adjusting your search or filter' : 'Share your event to get registrations!'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((reg, i) => {
              const sc = statusConfig[reg.status] || statusConfig.registered;
              const StatusIcon = sc.icon;
              return (
                <motion.div
                  key={reg._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 1fr',
                    padding: '0.9rem 1.5rem', alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Name + email */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <Avatar name={reg.user?.name} avatar={reg.user?.avatar} size={36} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {reg.user?.name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Mail size={11} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {reg.user?.email || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Institution */}
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Building size={13} style={{ color: '#475569', flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {reg.user?.institution || '—'}
                    </span>
                  </div>

                  {/* Dept / Year */}
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <GraduationCap size={13} style={{ color: '#475569' }} />
                      {reg.user?.department || '—'}
                    </div>
                    {reg.user?.year && (
                      <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>{reg.user.year}</div>
                    )}
                  </div>

                  {/* Registered at */}
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {reg.registeredAt ? format(new Date(reg.registeredAt), 'MMM dd, yyyy') : '—'}
                    <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: 1 }}>
                      {reg.registeredAt ? format(new Date(reg.registeredAt), 'hh:mm a') : ''}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '0.25rem 0.65rem', borderRadius: '9999px',
                      fontSize: '0.72rem', fontWeight: 600,
                      background: sc.bg, color: sc.color,
                    }}>
                      <StatusIcon size={11} />
                      {sc.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
          </div>
        </div>
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <div style={{ marginTop: '0.75rem', textAlign: 'right', fontSize: '0.78rem', color: '#475569' }}>
          Showing {filtered.length} of {registrations.length} participants
        </div>
      )}
    </div>
  );
}
