import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 30 });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const handleToggle = async (userId) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle`);
      toast.success(`User ${data.user.isActive ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>User Management</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{total} total users</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input className="input-field" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.5rem 1rem', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}>
          <option value="" style={{ background: '#141424' }}>All Roles</option>
          <option value="student" style={{ background: '#141424' }}>Student</option>
          <option value="organizer" style={{ background: '#141424' }}>Organizer</option>
          <option value="admin" style={{ background: '#141424' }}>Admin</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px 120px 100px', padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span>User</span><span>Email</span><span>Roles</span><span>Joined</span><span>Status</span>
          </div>
          {users.map((user, i) => (
            <motion.div key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px 120px 100px', padding: '0.9rem 1.25rem', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {user.name?.[0] || 'U'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{user.name}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {user.roles?.map((r) => (
                  <span key={r} style={{ padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, background: r === 'admin' ? 'rgba(239,68,68,0.15)' : r === 'organizer' ? 'rgba(6,182,212,0.15)' : 'rgba(124,58,237,0.15)', color: r === 'admin' ? '#f87171' : r === 'organizer' ? '#22d3ee' : '#a78bfa' }}>{r}</span>
                ))}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
              <button onClick={() => handleToggle(user._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: user.isActive ? '#4ade80' : '#f87171' }}>
                {user.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                {user.isActive ? 'Active' : 'Inactive'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
