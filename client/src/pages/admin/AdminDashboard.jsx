import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Award, Clock, TrendingUp, Activity } from 'lucide-react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/events'),
    ]).then(([statsRes, eventsRes]) => {
      setStats(statsRes.data.stats);
      setEvents(eventsRes.data.events?.slice(0, 8) || []);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  const s = stats || {};

  const statCards = [
    { label: 'Total Users', value: s.totalUsers, icon: Users, color: '#7c3aed' },
    { label: 'Students', value: s.totalStudents, icon: Users, color: '#06b6d4' },
    { label: 'Organizers', value: s.totalOrganizers, icon: Activity, color: '#4ade80' },
    { label: 'Total Events', value: s.totalEvents, icon: Calendar, color: '#fbbf24' },
    { label: 'Published', value: s.publishedEvents, icon: TrendingUp, color: '#f472b6' },
    { label: 'Registrations', value: s.totalRegistrations, icon: Users, color: '#fb923c' },
    { label: 'Certificates', value: s.totalCertificates, icon: Award, color: '#a78bfa' },
    { label: 'Pending Requests', value: s.pendingRequests, icon: Clock, color: '#f87171' },
  ];

  const chartData = [
    { name: 'Students', value: s.totalStudents || 0, color: '#7c3aed' },
    { name: 'Organizers', value: s.totalOrganizers || 0, color: '#06b6d4' },
    { name: 'Events', value: s.totalEvents || 0, color: '#4ade80' },
    { name: 'Certs', value: s.totalCertificates || 0, color: '#fbbf24' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>Admin Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Platform overview and management</p>
      </div>

      {s.pendingRequests > 0 && (
        <div style={{ padding: '0.9rem 1.25rem', borderRadius: '0.75rem', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.875rem', color: '#fbbf24', fontWeight: 600 }}>⚠ {s.pendingRequests} organizer request(s) awaiting review</span>
          <a href="/admin/organizer-requests" style={{ fontSize: '0.8rem', color: '#fbbf24', textDecoration: 'underline' }}>Review now →</a>
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.65rem' }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0' }}>{value ?? '—'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Chart */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Platform Overview</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#141424', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.8rem' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent events */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem' }}>Recent Events</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: 260, overflowY: 'auto' }}>
            {events.length === 0 ? <p style={{ fontSize: '0.83rem', color: '#64748b' }}>No events yet</p> : events.map((e) => (
              <div key={e._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem', borderRadius: '0.65rem', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{e.organizer?.name} · {e.category}</div>
                </div>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 4,
                  background: e.status === 'published' ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.12)',
                  color: e.status === 'published' ? '#4ade80' : '#94a3b8',
                }}>{e.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
