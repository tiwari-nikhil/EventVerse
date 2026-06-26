import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const interestOptions = [
  { id: 'ai-ml', label: 'AI / ML', emoji: '🤖' },
  { id: 'web-dev', label: 'Web Development', emoji: '🌐' },
  { id: 'hackathon', label: 'Hackathons', emoji: '💻' },
  { id: 'robotics', label: 'Robotics', emoji: '🤖' },
  { id: 'data-science', label: 'Data Science', emoji: '📊' },
  { id: 'cloud', label: 'Cloud / DevOps', emoji: '☁️' },
  { id: 'cybersecurity', label: 'Cybersecurity', emoji: '🔐' },
  { id: 'entrepreneurship', label: 'Entrepreneurship', emoji: '🚀' },
  { id: 'design', label: 'UI/UX Design', emoji: '🎨' },
  { id: 'cultural', label: 'Cultural Events', emoji: '🎭' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'volunteer', label: 'Volunteering / NSS', emoji: '🤝' },
  { id: 'research', label: 'Research', emoji: '🔬' },
  { id: 'networking', label: 'Networking', emoji: '👥' },
  { id: 'music', label: 'Music & Arts', emoji: '🎵' },
  { id: 'gaming', label: 'Gaming / Esports', emoji: '🎮' },
];

export default function OnboardingPage() {
  const [selected, setSelected] = useState([]);
  const { updateInterests, loading } = useAuthStore();
  const navigate = useNavigate();

  const toggle = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleContinue = async () => {
    if (selected.length < 3) return toast.error('Please select at least 3 interests');
    const res = await updateInterests(selected);
    if (res.success) {
      toast.success('Interests saved! Let\'s get started 🚀');
      navigate('/student/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="orb orb-purple" style={{ width: 400, height: 400, top: 0, right: 0, opacity: 0.1 }} />
      <div className="orb orb-cyan" style={{ width: 300, height: 300, bottom: 0, left: 0, opacity: 0.08 }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ maxWidth: 680, width: '100%', position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem', justifyContent: 'center' }}>
          <img src="/logo.png" alt="EventVerse Logo" style={{ width: 34, height: 34, objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#e2e8f0' }}>EventVerse</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '0.5rem' }}>
            What are you passionate about?
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Select at least <strong style={{ color: '#a78bfa' }}>3 interests</strong> to get personalized event recommendations
          </p>
        </div>

        {/* Interest grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
          {interestOptions.map(({ id, label, emoji }) => {
            const isSelected = selected.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                style={{
                  padding: '0.85rem 1rem', borderRadius: '0.75rem', cursor: 'pointer',
                  border: isSelected ? '2px solid #7c3aed' : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                  color: isSelected ? '#c4b5fd' : '#94a3b8',
                  fontWeight: isSelected ? 600 : 500, fontSize: '0.83rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'all 0.15s ease',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                {label}
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: -6, right: -6, width: 18, height: 18,
                    borderRadius: '50%', background: '#7c3aed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={11} color="white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {selected.length} selected {selected.length >= 3 && '✅'}
          </p>
          <button
            onClick={handleContinue}
            className="btn-primary"
            disabled={selected.length < 3 || loading}
            style={{ opacity: selected.length < 3 ? 0.5 : 1 }}
          >
            Continue to Dashboard <ArrowRight size={17} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
