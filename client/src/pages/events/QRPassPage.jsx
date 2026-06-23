import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Share2, Shield, Calendar, MapPin } from 'lucide-react';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export default function QRPassPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const passRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/registrations/${id}`);
        setRegistration(data.registration);
      } catch {
        toast.error('Registration not found');
        navigate('/student/registrations');
      } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const downloadPDF = async () => {
    if (!passRef.current) return;
    try {
      const canvas = await html2canvas(passRef.current, { backgroundColor: '#141424', scale: 2 });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [120, 200] });
      pdf.addImage(img, 'PNG', 0, 0, 120, 200);
      pdf.save(`EventVerse-Pass-${registration?.event?.title || 'event'}.pdf`);
      toast.success('QR Pass downloaded!');
    } catch { toast.error('Download failed'); }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  if (!registration) return null;

  const { event, qrCode, status, registeredAt } = registration;

  const statusColor = {
    registered: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', label: '✅ Registered' },
    attended: { bg: 'rgba(124,58,237,0.15)', color: '#a78bfa', label: '🎉 Attended' },
    cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: '❌ Cancelled' },
  }[status] || {};

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', flexDirection: 'column' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/student/registrations')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.4rem 0.75rem', color: '#94a3b8', cursor: 'pointer', fontSize: '0.82rem' }}>← Back</button>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0' }}>Your Event Pass</h1>
        </div>

        {/* Pass card */}
        <div ref={passRef} style={{
          background: 'linear-gradient(135deg, #141424 0%, #1e1b4b 100%)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '1.5rem', overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(124,58,237,0.2)',
        }}>
          {/* Header */}
          <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', position: 'relative' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.15em', marginBottom: 4 }}>EVENTVERSE • EVENT PASS</div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: 'white', marginBottom: 4, lineHeight: 1.2 }}>
              {event?.title}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 8 }}>
              {event?.startDate && <span>📅 {format(new Date(event.startDate), 'MMM dd, yyyy')}</span>}
              {event?.venue && <span>📍 {event.mode === 'online' ? 'Online' : event.venue}</span>}
            </div>
          </div>

          {/* Dashed border */}
          <div style={{ borderTop: '2px dashed rgba(255,255,255,0.1)', margin: '0 1.5rem' }} />

          {/* QR */}
          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', padding: '1rem', background: 'white', borderRadius: '1rem', marginBottom: '1rem' }}>
              {qrCode ? (
                <img src={qrCode} alt="QR Code" style={{ width: 180, height: 180, display: 'block' }} />
              ) : (
                <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem' }}>QR unavailable</div>
              )}
            </div>

            <div style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', display: 'inline-block', fontSize: '0.8rem', fontWeight: 700, ...statusColor }}>
              {statusColor.label}
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748b' }}>Attendee</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{user?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748b' }}>Institution</span>
                <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{user?.institution || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748b' }}>Registered</span>
                <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{format(new Date(registeredAt), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={14} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Verified EventVerse Pass • Show at event entrance</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button onClick={downloadPDF} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
            <Download size={16} /> Download PDF
          </button>
          <button onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            toast.success('Link copied!');
          }} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
            <Share2 size={16} /> Share
          </button>
        </div>
      </motion.div>
    </div>
  );
}
