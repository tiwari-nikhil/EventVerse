import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Building } from 'lucide-react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const orgTypes = ['club', 'society', 'cell', 'department', 'ngo', 'other'];
const categories = ['technical', 'cultural', 'sports', 'social', 'academic', 'other'];

export default function OrganizerRequestPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    organizationName: '', organizationType: 'club', category: 'technical',
    description: '', institution: user?.institution || '', website: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.organizationName || !form.description || !form.institution) return toast.error('Fill all required fields');
    setSubmitting(true);
    try {
      await api.post('/admin/organizer-requests', form);
      toast.success('Request submitted! Admin will review shortly 🎉');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 580, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Building size={26} style={{ color: '#a78bfa' }} />
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 8 }}>Become an Organizer</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Submit your organization details for admin review</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label className="form-label">Organization Name *</label>
            <input className="input-field" placeholder="e.g. Google Developer Groups" value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Type *</label>
              <select className="input-field" value={form.organizationType} onChange={(e) => setForm({ ...form, organizationType: e.target.value })}>
                {orgTypes.map(t => <option key={t} value={t} style={{ background: '#141424', textTransform: 'capitalize' }}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map(c => <option key={c} value={c} style={{ background: '#141424', textTransform: 'capitalize' }}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Description *</label>
            <textarea className="input-field" rows={4} placeholder="Tell us about your organization, its goals, and the kind of events you plan to organize..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical', fontFamily: 'inherit' }} required />
          </div>

          <div>
            <label className="form-label">Institution *</label>
            <input className="input-field" placeholder="Your college / university" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} required />
          </div>

          <div>
            <label className="form-label">Website (optional)</label>
            <input className="input-field" placeholder="https://yourclub.com" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>

          <div style={{ padding: '0.9rem', borderRadius: '0.75rem', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
            📋 <strong style={{ color: '#22d3ee' }}>Review Process:</strong> Our admin team will review your request within 24-48 hours. You'll receive a notification once approved.
          </div>

          <button type="submit" className="btn-primary" disabled={submitting} style={{ justifyContent: 'center', padding: '0.9rem', fontSize: '0.95rem' }}>
            {submitting ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><Send size={17} /> Submit Request</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
