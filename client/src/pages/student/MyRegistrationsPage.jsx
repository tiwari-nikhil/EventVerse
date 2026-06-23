import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, QrCode, X } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const statusConfig = {
  registered: { color: '#4ade80', bg: 'rgba(34,197,94,0.12)', label: 'Registered' },
  attended: { color: '#a78bfa', bg: 'rgba(124,58,237,0.12)', label: 'Attended' },
  cancelled: { color: '#f87171', bg: 'rgba(239,68,68,0.12)', label: 'Cancelled' },
  waitlisted: { color: '#fbbf24', bg: 'rgba(234,179,8,0.12)', label: 'Waitlisted' },
};

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchRegs = async () => {
    try {
      const { data } = await api.get('/registrations/my');
      setRegistrations(data.registrations || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchRegs(); }, []);

  const handleCancel = async (regId) => {
    if (!confirm('Cancel this registration?')) return;
    try {
      await api.delete(`/registrations/${regId}`);
      toast.success('Registration cancelled');
      fetchRegs();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = filter === 'all' ? registrations : registrations.filter((r) => r.status === filter);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>My Registrations</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{registrations.length} total registrations</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'registered', 'attended', 'cancelled'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.4rem 1rem', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, textTransform: 'capitalize',
            border: filter === f ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.1)',
            background: filter === f ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
            color: filter === f ? '#c4b5fd' : '#94a3b8',
          }}>{f === 'all' ? 'All' : statusConfig[f]?.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <p style={{ color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>No registrations found</p>
          <Link to="/events" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1rem', fontSize: '0.85rem' }}>Browse Events</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((reg, i) => {
            const s = statusConfig[reg.status] || statusConfig.registered;
            return (
              <motion.div key={reg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>

                {/* Event icon */}
                <div style={{ width: 60, height: 60, borderRadius: '0.75rem', background: reg.event?.banner ? `url(${reg.event.banner}) center/cover` : 'linear-gradient(135deg, #1e1b4b, #0f172a)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  {!reg.event?.banner && '📅'}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{reg.event?.title || 'Event'}</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#64748b', flexWrap: 'wrap' }}>
                    {reg.event?.startDate && <span className="flex items-center gap-1"><Calendar size={12} />{format(new Date(reg.event.startDate), 'MMM dd, yyyy')}</span>}
                    {reg.event?.venue && <span className="flex items-center gap-1">📍 {reg.event.mode === 'online' ? 'Online' : reg.event.venue}</span>}
                    <span className="flex items-center gap-1"><Clock size={12} />{format(new Date(reg.registeredAt), 'MMM dd')}</span>
                  </div>
                </div>

                {/* Status */}
                <span style={{ padding: '0.3rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: s.bg, color: s.color }}>
                  {s.label}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  {reg.status === 'registered' && (
                    <Link to={`/registrations/${reg._id}/qr`} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                      <QrCode size={14} /> QR Pass
                    </Link>
                  )}
                  {reg.status === 'attended' && (
                    <Link to="/student/portfolio" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                      🎓 Certificate
                    </Link>
                  )}
                  {reg.status === 'registered' && (
                    <button onClick={() => handleCancel(reg._id)} className="btn-danger" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
                      <X size={14} /> Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
