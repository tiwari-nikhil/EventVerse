import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Shield, Star, Trophy, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const CertificateCard = ({ cert }) => {
  const certRef = useRef(null);

  const downloadCert = async () => {
    if (!certRef.current) return;
    try {
      const canvas = await html2canvas(certRef.current, { backgroundColor: '#0f0f1a', scale: 2 });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      pdf.addImage(img, 'PNG', 0, 0, 297, 210);
      pdf.save(`Certificate-${cert.event?.title || 'EventVerse'}.pdf`);
      toast.success('Certificate downloaded!');
    } catch { toast.error('Download failed'); }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div ref={certRef} style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1e1b4b 50%, #0f172a 100%)',
        border: '2px solid rgba(124,58,237,0.4)',
        borderRadius: '1rem', padding: '2rem', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #7c3aed, #06b6d4, #7c3aed)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #7c3aed, #06b6d4, #7c3aed)' }} />
        <div className="orb orb-purple" style={{ width: 200, height: 200, top: -50, right: -50, opacity: 0.08 }} />
        <div className="orb orb-cyan" style={{ width: 150, height: 150, bottom: -50, left: -50, opacity: 0.06 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            EventVerse • Certificate of Participation
          </div>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>This certifies that</div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #a78bfa, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.25rem',
          }}>{cert.user?.name || 'Participant'}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
            successfully participated in
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem', lineHeight: 1.3 }}>
            {cert.event?.title}
          </div>
          {cert.event?.startDate && (
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem' }}>
              {format(new Date(cert.event.startDate), 'MMMM dd, yyyy')}
            </div>
          )}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '9999px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <Shield size={12} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 600 }}>{cert.verificationCode}</span>
          </div>
        </div>
      </div>

      <button onClick={downloadCert} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', fontSize: '0.85rem' }}>
        <Download size={15} /> Download Certificate
      </button>
    </div>
  );
};

export default function PortfolioPage() {
  const { user } = useAuthStore();
  const [certificates, setCertificates] = useState([]);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [certRes, regRes] = await Promise.all([
          api.get('/certificates/my'),
          api.get('/registrations/my'),
        ]);
        setCertificates(certRes.data.certificates || []);
        setRegs(regRes.data.registrations || []);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const attended = regs.filter((r) => r.status === 'attended').length;
  const points = user?.achievementPoints || attended * 10;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>My Portfolio</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Your verified achievement record</p>
      </motion.div>

      {/* Profile card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Events Attended', value: attended, icon: '🎯' },
          { label: 'Certificates', value: certificates.length, icon: '🏆' },
          { label: 'Achievement Points', value: points, icon: '⭐' },
          { label: 'Registrations', value: regs.length, icon: '📋' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{icon}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0' }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Interests */}
      {user?.interests?.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.75rem' }}>Interests & Skills</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {user.interests.map((i) => <span key={i} className="badge badge-purple" style={{ fontSize: '0.78rem' }}>{i}</span>)}
          </div>
        </div>
      )}

      {/* Certificates */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={18} style={{ color: '#a78bfa' }} /> Certificates ({certificates.length})
        </h2>
        {certificates.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {certificates.map((cert) => <CertificateCard key={cert._id} cert={cert} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#64748b' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎓</div>
            <p style={{ fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>No certificates yet</p>
            <p style={{ fontSize: '0.82rem', marginBottom: '1rem' }}>Attend events to earn verified certificates</p>
          </div>
        )}
      </div>
    </div>
  );
}
