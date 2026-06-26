import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Shield, Calendar, User, Tag, ExternalLink, Home } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import QRCode from 'qrcode';

export default function VerifyCertificatePage() {
  const { code } = useParams();
  const [status, setStatus] = useState('loading'); // loading | valid | invalid | error
  const [cert, setCert] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get(`/certificates/verify/${code}`);
        if (data.valid && data.certificate) {
          setCert(data.certificate);
          setStatus('valid');
          // Generate QR for this very URL
          QRCode.toDataURL(window.location.href, {
            width: 100, margin: 1,
            color: { dark: '#1e1b4b', light: '#ffffff' },
            errorCorrectionLevel: 'H',
          }).then(setQrDataUrl).catch(() => {});
        } else {
          setStatus('invalid');
        }
      } catch (err) {
        if (err.response?.status === 404 || err.response?.data?.valid === false) {
          setStatus('invalid');
        } else {
          setStatus('error');
        }
      }
    };
    verify();
  }, [code]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'Inter', 'Arial', sans-serif",
    }}>
      {/* Brand header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.5rem', textAlign: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '0.5rem' }}>
          <div style={{
            width: 42, height: 42,
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px',
          }}>
            🎓
          </div>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.5rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #a78bfa, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            EventVerse
          </span>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Certificate Verification Portal
        </p>
      </motion.div>

      {/* ── Loading ── */}
      {status === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', color: '#94a3b8' }}
        >
          <div className="spinner" style={{ width: 48, height: 48, margin: '0 auto 1.5rem', borderWidth: 3 }} />
          <p style={{ fontSize: '0.95rem' }}>Verifying certificate…</p>
          <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: 6 }}>Code: {code}</p>
        </motion.div>
      )}

      {/* ── Invalid / Error ── */}
      {(status === 'invalid' || status === 'error') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '1.25rem', padding: '2.5rem', textAlign: 'center', maxWidth: 440,
          }}
        >
          <XCircle size={56} style={{ color: '#f87171', margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f87171', marginBottom: '0.5rem' }}>
            {status === 'invalid' ? 'Certificate Not Found' : 'Verification Failed'}
          </h1>
          <p style={{ color: '#fca5a5', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {status === 'invalid'
              ? 'No certificate with this verification code was found. It may be invalid, revoked, or the code was mistyped.'
              : 'An error occurred while verifying. Please try again or contact support.'}
          </p>
          <div style={{
            background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem', padding: '0.75rem',
            fontFamily: 'monospace', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem',
          }}>
            Code: {code}
          </div>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '0.65rem 1.5rem', borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            color: '#fff', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
          }}>
            <Home size={15} /> Go to EventVerse
          </Link>
        </motion.div>
      )}

      {/* ── Valid ── */}
      {status === 'valid' && cert && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          style={{ width: '100%', maxWidth: 700 }}
        >
          {/* Success banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '1rem 1.5rem', borderRadius: '0.9rem',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            marginBottom: '1.5rem',
          }}>
            <CheckCircle size={22} style={{ color: '#4ade80', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#4ade80', fontSize: '0.95rem' }}>Certificate Verified ✓</div>
              <div style={{ color: '#86efac', fontSize: '0.8rem' }}>
                This certificate is authentic and was issued by EventVerse
              </div>
            </div>
          </div>

          {/* Certificate detail card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1.25rem', overflow: 'hidden',
          }}>
            {/* Gold top bar */}
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #7c3aed, #b8943f, #06b6d4)' }} />

            <div style={{ padding: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Left — details */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{
                  fontSize: '0.65rem', fontWeight: 700, color: '#64748b',
                  letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.25rem',
                }}>
                  Certificate Details
                </div>

                {[
                  {
                    icon: <User size={15} />,
                    label: 'Recipient',
                    value: cert.user?.name || '—',
                    sub: cert.user?.email,
                  },
                  {
                    icon: <Tag size={15} />,
                    label: 'Event',
                    value: cert.event?.title || '—',
                    sub: cert.event?.category,
                  },
                  {
                    icon: <Calendar size={15} />,
                    label: 'Event Date',
                    value: cert.event?.startDate
                      ? format(new Date(cert.event.startDate), 'MMMM dd, yyyy')
                      : '—',
                  },
                  {
                    icon: <Calendar size={15} />,
                    label: 'Certificate Issued',
                    value: cert.issuedAt
                      ? format(new Date(cert.issuedAt), 'MMMM dd, yyyy')
                      : '—',
                  },
                  {
                    icon: <Shield size={15} />,
                    label: 'Type',
                    value: (cert.type || 'participation').charAt(0).toUpperCase() + (cert.type || 'participation').slice(1),
                  },
                ].map(({ icon, label, value, sub }) => (
                  <div key={label} style={{
                    display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                    padding: '0.85rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ color: '#7c3aed', marginTop: 2, flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '2px' }}>{label}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0' }}>{value}</div>
                      {sub && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sub}</div>}
                    </div>
                  </div>
                ))}

                {/* Verification code */}
                <div style={{
                  marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.65rem 1rem', borderRadius: '0.75rem',
                  background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
                }}>
                  <Shield size={14} style={{ color: '#a78bfa', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Verification Code</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: '#a78bfa' }}>
                      {cert.verificationCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — QR */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.75rem', minWidth: 140,
              }}>
                {/* Seal */}
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'radial-gradient(circle at 40% 40%, #7c3aed, #1e1b4b)',
                  border: '2px solid #b8943f',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
                }}>
                  <div style={{ fontSize: '24px' }}>🏅</div>
                  <div style={{ fontSize: '0.3rem', color: '#c4b5fd', fontWeight: 700, letterSpacing: '0.06em' }}>VERIFIED</div>
                </div>

                {/* QR code */}
                {qrDataUrl && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      padding: '8px', background: '#fff', borderRadius: '10px',
                      border: '2px solid rgba(184,148,63,0.5)',
                      display: 'inline-block', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    }}>
                      <img src={qrDataUrl} alt="Verify QR" style={{ width: 90, height: 90, display: 'block' }} />
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.4rem' }}>
                      Scan to re-verify
                    </div>
                  </div>
                )}

                <div style={{
                  padding: '4px 10px', borderRadius: '20px',
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                  fontSize: '0.7rem', color: '#4ade80', fontWeight: 600,
                }}>
                  ✓ Authentic
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '0.6rem 1.5rem', borderRadius: '0.75rem',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none',
            }}>
              <Home size={14} /> Visit EventVerse
            </Link>
            <p style={{ fontSize: '0.72rem', color: '#334155', marginTop: '0.75rem' }}>
              This verification page is publicly accessible. The certificate is authentic and was issued by EventVerse.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
