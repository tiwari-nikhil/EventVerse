import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Share2, Shield, Calendar, MapPin, User, Building, ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

/* ── QR Image component — uses toDataURL so size is always exact ─────── */
function QRImage({ data, size = 160 }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    if (!data) return;
    QRCode.toDataURL(data, {
      width: size * 2,   // 2× resolution for sharpness on HiDPI screens
      margin: 1,
      color: { dark: '#0f0a2e', light: '#ffffff' },
    }).then(setSrc).catch(console.error);
  }, [data, size]);

  if (!data || !src) return (
    <div style={{ width: size, height: size, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#94a3b8' }}>
      QR loading…
    </div>
  );

  // img always respects CSS width/height — no canvas attribute conflict
  return (
    <img
      src={src}
      alt="Event QR Code"
      draggable={false}
      style={{ width: size, height: size, display: 'block', borderRadius: 4 }}
    />
  );
}


/* ── Status config ──────────────────────────────────────────────────── */
const STATUS = {
  registered: { label: 'REGISTERED', color: '#4ade80', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.35)', Icon: CheckCircle },
  attended: { label: 'ATTENDED', color: '#a78bfa', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.35)', Icon: CheckCircle },
  cancelled: { label: 'CANCELLED', color: '#f87171', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)', Icon: XCircle },
};

/* ── Detail row ─────────────────────────────────────────────────────── */
function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.55rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <Icon size={13} style={{ color: '#6d28d9', marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', wordBreak: 'break-word' }}>{value}</div>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function QRPassPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/registrations/${id}`);
        setRegistration(data.registration);
      } catch {
        toast.error('Registration not found');
        navigate('/student/registrations');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ── PDF download — pure canvas, no html2canvas ─────────────────── */
  const downloadPDF = async () => {
    if (!registration) return;
    toast.loading('Generating PDF…');
    try {
      const qrPayload = registration.qrData || registration.qrCode || id;

      // Canvas size — landscape ticket proportions
      const W = 900, H = 380;
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const ctx = c.getContext('2d');

      // ── Background
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#0f0f1a');
      bg.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = bg;
      roundRect(ctx, 0, 0, W, H, 24); ctx.fill();

      // ── Purple left stripe
      const stripe = ctx.createLinearGradient(0, 0, 260, H);
      stripe.addColorStop(0, '#6d28d9');
      stripe.addColorStop(1, '#4f46e5');
      ctx.fillStyle = stripe;
      roundRectLeft(ctx, 0, 0, 260, H, 24); ctx.fill();

      // ── EventVerse logo text
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.letterSpacing = '3px';
      ctx.fillText('EVENTVERSE', 28, 38);

      // ── "EVENT PASS" label
      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillText('EVENT PASS', 28, 56);

      // ── QR code
      const QR_SIZE = 180;
      const qrTmp = document.createElement('canvas');
      await QRCode.toCanvas(qrTmp, qrPayload, { width: QR_SIZE * 2, margin: 1, color: { dark: '#0f0a2e', light: '#ffffff' } });
      const qrX = (260 - QR_SIZE) / 2;
      const qrY = (H - QR_SIZE) / 2 + 8;

      // White QR backing
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, qrX - 10, qrY - 10, QR_SIZE + 20, QR_SIZE + 20, 12); ctx.fill();
      ctx.drawImage(qrTmp, qrX, qrY, QR_SIZE, QR_SIZE);

      // ── Perforated divider
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(260, 20); ctx.lineTo(260, H - 20); ctx.stroke();
      ctx.setLineDash([]);

      // ── Right side content
      const RX = 290;
      let ry = 52;

      // Event title
      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#f1f5f9';
      ry = wrapTextPDF(ctx, registration.event?.title || 'Event', RX, ry, W - RX - 28, 34);
      ry += 10;

      // Category badge
      if (registration.event?.category) {
        const cat = registration.event.category.toUpperCase();
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#a78bfa';
        const bw = ctx.measureText(cat).width + 20;
        ctx.fillStyle = 'rgba(124,58,237,0.2)';
        roundRect(ctx, RX, ry, bw, 22, 11); ctx.fill();
        ctx.strokeStyle = 'rgba(124,58,237,0.4)';
        ctx.lineWidth = 1;
        roundRect(ctx, RX, ry, bw, 22, 11); ctx.stroke();
        ctx.fillStyle = '#a78bfa';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(cat, RX + 10, ry + 15);
        ry += 34;
      }

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(RX, ry); ctx.lineTo(W - 24, ry); ctx.stroke();
      ry += 16;

      // Details grid (2 columns)
      const details = [
        ['DATE', registration.event?.startDate ? format(new Date(registration.event.startDate), 'MMM dd, yyyy') : null],
        ['VENUE', registration.event?.venue || (registration.event?.mode === 'online' ? 'Online' : null)],
        ['ATTENDEE', user?.name || '—'],
        ['INSTITUTION', user?.institution || '—'],
        ['REGISTERED', registration.registeredAt ? format(new Date(registration.registeredAt), 'MMM dd, yyyy') : '—'],
        ['STATUS', (STATUS[registration.status] || STATUS.registered).label],
      ].filter(([, v]) => v);

      const COL_W = (W - RX - 28) / 2;
      details.forEach(([label, value], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const dx = RX + col * COL_W;
        const dy = ry + row * 52;

        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText(label, dx, dy);

        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = label === 'STATUS' ? (STATUS[registration.status]?.color || '#4ade80') : '#e2e8f0';
        ctx.fillText(value, dx, dy + 18);
      });

      // ── Footer
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      roundRectBottom(ctx, 0, H - 44, W, 44, 24); ctx.fill();
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.fillText('🔒 Verified EventVerse Pass  •  Present this QR code at the event entrance', W / 2, H - 16);
      ctx.textAlign = 'left';

      // ── Export
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [180, 76] });
      pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, 180, 76);
      pdf.save(`EventVerse-Pass-${registration?.event?.title?.replace(/\s+/g, '-') || 'pass'}.pdf`);
      toast.dismiss();
      toast.success('Pass downloaded!');
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error('Download failed');
    }
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );
  if (!registration) return null;

  const { event, qrData, qrCode, status, registeredAt } = registration;
  const qrPayload = qrData || qrCode || id;
  const sc = STATUS[status] || STATUS.registered;
  const StatusIcon = sc.Icon;

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ width: '100%', maxWidth: 800 }}
      >
        {/* ── Top nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate('/student/registrations')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.45rem 0.9rem', color: '#94a3b8', cursor: 'pointer', fontSize: '0.82rem' }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0' }}>
            Event Pass
          </h1>
          <div style={{ width: 64 }} />
        </div>

        {/* ── Pass card — horizontal layout ─────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1535 100%)',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: '1.25rem',
          overflow: 'hidden',
          boxShadow: '0 32px 64px rgba(109,40,217,0.25), 0 0 0 1px rgba(124,58,237,0.1)',
          display: 'flex',
          position: 'relative',
        }}>
          {/* ─ Left panel — QR + branding */}
          <div style={{
            width: 230,
            flexShrink: 0,
            background: 'linear-gradient(160deg, #6d28d9 0%, #4f46e5 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            padding: '1.5rem 1.25rem',
            gap: '1rem',
            position: 'relative',
          }}>
            {/* Dot-grid texture */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '14px 14px', pointerEvents: 'none', borderRadius: 'inherit' }} />

            {/* Logo */}
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, fontWeight: 900, color: 'white', margin: '0 auto 7px', fontFamily: "'Space Grotesk', sans-serif", boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>E</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.12em' }}>EVENTVERSE</div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', marginTop: 3, letterSpacing: '0.08em' }}>EVENT PASS</div>
            </div>

            {/* QR code — sized to fill panel width with equal side margins */}
            <div style={{
              background: 'white',
              borderRadius: '0.85rem',
              padding: '0.65rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
              position: 'relative', zIndex: 1,
              lineHeight: 0,
            }}>
              <QRImage data={qrPayload} size={156} />
            </div>

            {/* Status badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '0.38rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(0,0,0,0.28)',
              border: `1px solid ${sc.border}`,
              position: 'relative', zIndex: 1,
            }}>
              <StatusIcon size={11} style={{ color: sc.color }} />
              <span style={{ fontSize: '0.67rem', fontWeight: 800, color: sc.color, letterSpacing: '0.06em' }}>{sc.label}</span>
            </div>
          </div>

          {/* Perforated divider */}
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', position: 'relative', flexShrink: 0 }}>
            {/* Top circle notch */}
            <div style={{ position: 'absolute', top: -14, left: -14, width: 28, height: 28, borderRadius: '50%', background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)' }} />
            {/* Bottom circle notch */}
            <div style={{ position: 'absolute', bottom: -14, left: -14, width: 28, height: 28, borderRadius: '50%', background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)' }} />
            {/* Dashes */}
            <div style={{ position: 'absolute', inset: '20px 0', backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 6px, rgba(255,255,255,0.12) 6px, rgba(255,255,255,0.12) 12px)' }} />
          </div>

          {/* ─ Right panel — event details */}
          <div style={{ flex: 1, padding: '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
            {/* Event header */}
            <div>
              {/* Category pill */}
              {event?.category && (
                <div style={{ marginBottom: '0.6rem' }}>
                  <span style={{ display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {event.category}
                  </span>
                </div>
              )}

              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.3, marginBottom: '0.2rem' }}>
                {event?.title}
              </h2>
              {event?.description && (
                <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5, marginBottom: '0.2rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {event.description}
                </p>
              )}
            </div>

            {/* Horizontal rule */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0.85rem 0' }} />

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
              <DetailRow icon={Calendar} label="Date" value={event?.startDate ? format(new Date(event.startDate), 'MMM dd, yyyy') : null} />
              <DetailRow icon={User} label="Attendee" value={user?.name} />
              <DetailRow icon={MapPin} label="Venue" value={event?.venue || (event?.mode === 'online' ? 'Online Event' : null)} />
              <DetailRow icon={Building} label="Institution" value={user?.institution || '—'} />
            </div>

            {/* Horizontal rule */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0.85rem 0' }} />

            {/* Footer row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={12} style={{ color: '#7c3aed' }} />
                <span style={{ fontSize: '0.68rem', color: '#475569' }}>
                  Registered {registeredAt ? format(new Date(registeredAt), 'MMM dd, yyyy') : ''}
                </span>
              </div>
              <span style={{ fontSize: '0.65rem', color: '#334155', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                #{id.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* ── Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button onClick={downloadPDF} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.7rem' }}>
            <Download size={16} /> Download PDF
          </button>
          <button
            onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center', padding: '0.7rem' }}
          >
            <Share2 size={16} /> Share Pass
          </button>
        </div>

        {/* ── Scan hint */}
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#334155', marginTop: '0.85rem' }}>
          Present the QR code to the event organiser for attendance verification
        </p>
      </motion.div>
    </div>
  );
}

/* ── Canvas helpers ─────────────────────────────────────────────────── */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
function roundRectLeft(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
function roundRectBottom(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y);
  ctx.closePath();
}
function wrapTextPDF(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineH;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
  return y + lineH;
}