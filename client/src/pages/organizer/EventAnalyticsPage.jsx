import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart2, Users, Award, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../api/axios';

const COLORS = ['#7c3aed', '#06b6d4', '#4ade80', '#fbbf24', '#f472b6', '#fb923c', '#a78bfa', '#22d3ee'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#141424', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
      <p style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</p>
      {payload.map((p) => <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function EventAnalyticsPage() {
  const { id: eventId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/analytics/${eventId}`)
      .then(({ data }) => setAnalytics(data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;
  if (!analytics) return <div style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>No analytics available</div>;

  const { title, totalRegistrations, totalAttended, totalCertificates, attendanceRate, capacity, fillRate, deptBreakdown, yearBreakdown, hourlyScans } = analytics;

  const statCards = [
    { label: 'Registered', value: totalRegistrations, icon: Users, color: '#7c3aed', sub: `/ ${capacity} capacity` },
    { label: 'Attended', value: totalAttended, icon: TrendingUp, color: '#06b6d4', sub: `${attendanceRate}% rate` },
    { label: 'Certificates', value: totalCertificates, icon: Award, color: '#4ade80', sub: 'Auto-generated' },
    { label: 'Fill Rate', value: `${fillRate}%`, icon: BarChart2, color: '#fbbf24', sub: 'Of capacity' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>Event Analytics</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{title}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map(({ label, value, icon: Icon, color, sub }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Icon size={19} style={{ color }} />
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#e2e8f0' }}>{value}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{label}</div>
            <div style={{ fontSize: '0.72rem', color: color, marginTop: 2 }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Dept breakdown */}
        {deptBreakdown?.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Attendance by Department</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="dept" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                  {deptBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Year breakdown */}
        {yearBreakdown?.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Attendance by Year</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={yearBreakdown} dataKey="count" nameKey="year" cx="50%" cy="50%" outerRadius={90} label={({ year, percent }) => `${year} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}>
                  {yearBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Hourly scans */}
      {hourlyScans && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem' }}>Attendance Pattern (Hourly)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={hourlyScans}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="scans" name="Scans" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
