import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (res.success) {
      toast.success(`Welcome back, ${res.user.name}!`);
      const role = res.user.activeRole || 'student';
      if (!res.user.onboardingComplete && role === 'student') {
        navigate('/onboarding');
      } else {
        navigate(`/${role}/dashboard`);
      }
    } else {
      toast.error(res.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f0f1a' }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'none', padding: '3rem',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f0f1a 100%)',
        flexDirection: 'column', justifyContent: 'space-between',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        '@media(min-width:768px)': { display: 'flex' },
      }}
        className="md:flex"
      >
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white' }}>E</div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#e2e8f0' }}>EventVerse</span>
        </Link>

        <div>
          <div className="orb orb-purple" style={{ width: 300, height: 300, top: '30%', left: '20%', opacity: 0.2, position: 'absolute' }} />
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '1rem', lineHeight: 1.2 }}>
            Your Student Growth<br /><span className="gradient-text">Journey Awaits</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['Discover events tailored to your interests', 'Earn verified certificates automatically', 'Build a portfolio that gets you noticed'].map((item) => (
              <div key={item} className="flex items-center gap-3" style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#475569' }}>© 2025 EventVerse</p>
      </div>

      {/* Right - form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 6 }}>Welcome back</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@university.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem', marginTop: 4 }}>
              {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Sign In <ArrowRight size={17} /></>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600 }}>Create one free</Link>
          </div>

          {/* Demo accounts */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>Demo Accounts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: 'Student', email: 'student@demo.com', pass: 'demo123' },
                { label: 'Organizer', email: 'organizer@demo.com', pass: 'demo123' },
                { label: 'Admin', email: 'admin@demo.com', pass: 'demo123' },
              ].map(({ label, email, pass }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm({ email, password: pass })}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', fontSize: '0.75rem', color: '#7c3aed',
                    padding: '0.2rem 0', fontWeight: 500,
                  }}
                >
                  → Use {label} demo
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
