import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Building, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const roles = [
  { value: 'student', label: '🎓 Student', desc: 'Discover & attend events, earn certificates' },
  { value: 'organizer', label: '🎪 Organizer', desc: 'Create & manage events (requires admin approval)' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', institution: '', department: '', year: '' });
  const [showPass, setShowPass] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    const res = await register(form);
    if (res.success) {
      toast.success('Account created! Welcome to EventVerse 🎉');
      if (form.role === 'student') navigate('/onboarding');
      else navigate('/become-organizer');
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f0f1a' }}>
      {/* Left */}
      <div className="hidden md:flex" style={{ flex: 1, padding: '3rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white' }}>E</div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#e2e8f0' }}>EventVerse</span>
        </Link>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '1rem', lineHeight: 1.2 }}>
            Start Building Your<br /><span className="gradient-text">Digital Portfolio</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.7 }}>
            Every event you attend, every certificate you earn, every leadership role you take — it all builds your verified student profile on EventVerse.
          </p>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#475569' }}>© 2025 EventVerse</p>
      </div>

      {/* Right */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 460, padding: '1rem 0' }}
        >
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 6 }}>Create your account</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Join the student growth ecosystem</p>
          </div>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {roles.map(({ value, label, desc }) => (
              <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                style={{
                  padding: '0.9rem', borderRadius: '0.75rem', textAlign: 'left', cursor: 'pointer',
                  border: form.role === value ? '2px solid #7c3aed' : '1px solid rgba(255,255,255,0.1)',
                  background: form.role === value ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.04)',
                  transition: 'all 0.2s',
                }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: form.role === value ? '#c4b5fd' : '#e2e8f0', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>{desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input className="input-field" placeholder="Your full name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ paddingLeft: '2.5rem' }} required />
              </div>
            </div>

            <div>
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input type="email" className="input-field" placeholder="you@university.edu" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ paddingLeft: '2.5rem' }} required />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="Min. 6 characters" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Institution</label>
              <div style={{ position: 'relative' }}>
                <Building size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input className="input-field" placeholder="Your college / university" value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })} style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Department</label>
                <input className="input-field" placeholder="e.g. CS, ECE" value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Year</label>
                <select className="input-field" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                  <option value="">Select</option>
                  {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'].map(y => (
                    <option key={y} value={y} style={{ background: '#141424' }}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem', marginTop: 4 }}>
              {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Create Account <ArrowRight size={17} /></>}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
