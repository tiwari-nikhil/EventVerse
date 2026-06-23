import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminOrgRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [reviewNote, setReviewNote] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/organizer-requests?status=${filter}`);
      setRequests(data.requests || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/organizer-requests/${id}/approve`);
      toast.success('Organizer approved! Organization created.');
      fetchRequests();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/admin/organizer-requests/${id}/reject`, { reviewNote });
      toast.success('Request rejected');
      setSelectedReq(null);
      setReviewNote('');
      fetchRequests();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const statusConfig = {
    pending: { color: '#fbbf24', icon: <Clock size={15} /> },
    approved: { color: '#4ade80', icon: <CheckCircle size={15} /> },
    rejected: { color: '#f87171', icon: <XCircle size={15} /> },
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>Organizer Requests</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Review and approve organization verification requests</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['pending', 'approved', 'rejected'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.4rem 1.1rem', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, textTransform: 'capitalize',
            border: filter === f ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.1)',
            background: filter === f ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
            color: filter === f ? '#c4b5fd' : '#94a3b8',
          }}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#64748b' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
          <p>No {filter} requests</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map((req, i) => {
            const sc = statusConfig[req.status] || statusConfig.pending;
            return (
              <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {req.user?.name?.[0] || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{req.user?.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{req.user?.email}</div>
                      </div>
                      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: sc.color, fontWeight: 600 }}>
                        {sc.icon} {req.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{req.organizationName}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <span className="badge badge-purple">{req.organizationType}</span>
                      <span className="badge badge-cyan">{req.category}</span>
                      {req.institution && <span className="badge" style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.3)' }}>🏛 {req.institution}</span>}
                    </div>

                    <p style={{ fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '0.5rem' }}>{req.description}</p>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                      Submitted {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                      {req.reviewNote && <span style={{ display: 'block', color: '#f87171', marginTop: 4 }}>Note: {req.reviewNote}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'flex-end', minWidth: 150 }}>
                      <button onClick={() => handleApprove(req._id)} style={{
                        padding: '0.6rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                        background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)',
                        display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                      }}>
                        <CheckCircle size={16} /> Approve
                      </button>

                      {selectedReq === req._id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <input className="input-field" placeholder="Rejection reason..." value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }} />
                          <button onClick={() => handleReject(req._id)} style={{
                            padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                            background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                          }}>
                            <XCircle size={15} /> Confirm Reject
                          </button>
                          <button onClick={() => setSelectedReq(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.78rem' }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setSelectedReq(req._id)} style={{
                          padding: '0.6rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                          background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)',
                          display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
                        }}>
                          <XCircle size={16} /> Reject
                        </button>
                      )}
                    </div>
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
