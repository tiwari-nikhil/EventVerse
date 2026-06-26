import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Award, QrCode, BarChart2, Users, Star,
  ArrowRight, CheckCircle, Globe, Shield, ChevronRight, LayoutDashboard
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const features = [
  {
    icon: Zap, title: 'Smart Discovery', color: '#fbbf24',
    desc: 'AI-powered event recommendations based on your interests and participation history.',
  },
  {
    icon: QrCode, title: 'QR Attendance', color: '#06b6d4',
    desc: 'Instant, fraud-proof attendance tracking via unique QR passes — no manual sheets.',
  },
  {
    icon: Award, title: 'Auto Certificates', color: '#a78bfa',
    desc: 'Verified certificates generated instantly upon attendance with unique verification IDs.',
  },
  {
    icon: BarChart2, title: 'Rich Analytics', color: '#4ade80',
    desc: 'Organizers get real-time insights: registrations, attendance rates, demographics.',
  },
  {
    icon: Users, title: 'Student Portfolio', color: '#f472b6',
    desc: 'Every event builds your verifiable profile — achievements, certificates, leadership.',
  },
  {
    icon: Globe, title: 'Multi-Role Platform', color: '#fb923c',
    desc: 'One account, multiple roles. Switch between student, organizer, and admin seamlessly.',
  },
];

const steps = [
  { step: '01', title: 'Sign Up & Set Interests', desc: 'Create your profile and choose domains like AI/ML, Web Dev, Hackathons, Sports.' },
  { step: '02', title: 'Discover Events', desc: 'Get personalized recommendations from clubs, societies, and departments.' },
  { step: '03', title: 'Register & Get QR Pass', desc: 'Register in one click and receive your unique QR attendance pass.' },
  { step: '04', title: 'Attend & Earn', desc: 'Scan QR at the event, auto-receive certificate, and grow your portfolio.' },
];

const stats = [
  { value: '10K+', label: 'Students' },
  { value: '500+', label: 'Events Created' },
  { value: '98%', label: 'Attendance Accuracy' },
  { value: '50+', label: 'Institutions' },
];

export default function LandingPage() {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (token) {
      const role = user?.activeRole || 'student';
      navigate(`/${role}/dashboard`);
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="page-container" style={{ overflowX: 'hidden' }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5%', height: 70,
        background: 'rgba(15,15,26,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="EventVerse Logo" style={{ width: 34, height: 34, objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0' }}>
            Event<span className="gradient-text">Verse</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/events" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Browse Events</Link>
          {token ? (
            <button onClick={handleGetStarted} className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>
              Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>Sign In</Link>
              <Link to="/register" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 70, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative orbs */}
        <div className="orb orb-purple" style={{ width: 500, height: 500, top: -100, left: -150 }} />
        <div className="orb orb-cyan" style={{ width: 400, height: 400, bottom: -100, right: -100 }} />
        <div className="orb orb-indigo" style={{ width: 300, height: 300, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 5%', position: 'relative', zIndex: 1, width: '100%' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ textAlign: 'center' }}
          >
            <div className="badge badge-purple" style={{ marginBottom: '1.5rem', display: 'inline-flex', fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
              <Star size={13} /> Student Growth Ecosystem
            </div>

            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(2.8rem, 7vw, 5rem)',
              fontWeight: 800, lineHeight: 1.1,
              color: '#e2e8f0', marginBottom: '1.5rem',
            }}>
              Transforming Event
              <br />
              <span className="gradient-text">Participation into</span>
              <br />
              Student Growth
            </h1>

            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#94a3b8', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
              Discover events, earn verified certificates, build your portfolio, and unlock career opportunities — all in one platform built for students.
            </p>

            <div className="flex items-center justify-center gap-4" style={{ flexWrap: 'wrap' }}>
              <button onClick={handleGetStarted} className="btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2rem', gap: '0.6rem', display: 'flex', alignItems: 'center' }}>
                {token ? (
                  <><LayoutDashboard size={18} /> Go to Dashboard</>
                ) : (
                  <>Get Started Free <ArrowRight size={18} /></>
                )}
              </button>
              <Link to="/events" className="btn-secondary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
                Browse Events
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-2" style={{ marginTop: '2rem', flexWrap: 'wrap' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />)}
              <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: 8 }}>Trusted by students across 50+ institutions</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1.25rem', padding: '1.5rem 2rem',
              backdropFilter: 'blur(12px)',
            }}
          >
            {stats.map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '2rem', fontWeight: 800,
                  background: 'linear-gradient(135deg, #a78bfa, #06b6d4)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{value}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '6rem 5%', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Platform Features</div>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800, color: '#e2e8f0', marginBottom: '0.75rem',
          }}>
            Everything You Need to <span className="gradient-text">Thrive</span>
          </h2>
          <p style={{ color: '#64748b', maxWidth: 500, margin: '0 auto', fontSize: '1rem' }}>
            From discovery to portfolio — EventVerse handles the entire student event lifecycle.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {features.map(({ icon: Icon, title, color, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '1rem', padding: '1.75rem',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color + '40';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 20px 40px ${color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12, marginBottom: '1rem',
                background: color + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${color}30`,
              }}>
                <Icon size={22} style={{ color }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#e2e8f0', marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '4rem 5%', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge badge-purple" style={{ marginBottom: '1rem', display: 'inline-flex' }}>How It Works</div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: '#e2e8f0' }}>
              Your Growth Journey in <span className="gradient-text">4 Simple Steps</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {steps.map(({ step, title, desc }) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                style={{ textAlign: 'center', padding: '1.5rem' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 1rem',
                  background: 'linear-gradient(135deg, #7c3aed20, #06b6d420)',
                  border: '2px solid rgba(124,58,237,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 800,
                  color: '#a78bfa',
                }}>{step}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '6rem 5%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="orb orb-purple" style={{ width: 400, height: 400, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.1 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#e2e8f0', marginBottom: '1rem' }}>
            Ready to Build Your <span className="gradient-text">Student Legacy?</span>
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1rem' }}>
            Join thousands of students transforming event participation into career-ready achievements.
          </p>
          <button onClick={handleGetStarted} className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {token ? (
              <><LayoutDashboard size={18} /> Go to Dashboard</>
            ) : (
              <>Start Your Journey <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '2rem 5%', textAlign: 'center', color: '#475569', fontSize: '0.82rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <img src="/logo.png" alt="EventVerse Logo" style={{ width: 22, height: 22, objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#94a3b8' }}>EventVerse</span>
        </div>
        <p>© 2025 EventVerse. Transforming Event Participation into Student Growth.</p>
      </footer>
    </div>
  );
}
