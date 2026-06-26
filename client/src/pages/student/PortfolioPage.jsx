import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

function getVerifyUrl(code) {
  return `${window.location.origin}/verify/${code}`;
}

const CERT_TYPE_LABELS = {
  participation: 'Participation',
  winner:        'Excellence',
  volunteer:     'Volunteering',
  organizer:     'Organization',
  speaker:       'Speaking',
};

// ─── Pure-jsPDF Certificate Builder (A4 Landscape, mm units) ─────────────────
//
// Layout (fully centred, 297×210 mm):
//  ┌────────────────────── tri-colour bar (4.5mm) ──────────────────────────┐
//  │  EVENTVERSE (left)                 [Certificate of XXX badge] (right)  │
//  │  ─────────────── gold rule with diamond ornament ───────────────────── │
//  │                   THIS IS TO CERTIFY THAT                              │
//  │                   [  Recipient Name (big)  ]                           │
//  │                   ──────── ✦ ────────                                  │
//  │                   has successfully participated in                     │
//  │                   [  Event Title  ]                                    │
//  │                   [ category pill ]   Held on DD MMM YYYY              │
//  │  ─────────────────── thin gold rule ───────────────────────────────────│
//  │  [🏅 VERIFIED Seal]  Issued: DATE  /  verify URL  [QR Code]            │
//  │  Authorized Signatory                              Scan to Verify      │
//  └────────────────────── tri-colour bar (4.5mm) ──────────────────────────┘

async function buildCertificatePDF(cert, recipientName, qrDataUrl) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297, H = 210;
  const CX = W / 2; // 148.5 mm — horizontal centre

  const eventTitle = cert.event?.title || 'EventVerse Event';
  const certType   = cert.type || 'participation';
  const certLabel  = CERT_TYPE_LABELS[certType] || 'Participation';
  const eventDate  = cert.event?.startDate
    ? format(new Date(cert.event.startDate), 'MMMM dd, yyyy') : '';
  const issuedDate = cert.issuedAt
    ? format(new Date(cert.issuedAt), 'MMMM dd, yyyy') : eventDate;
  const verifyUrl  = getVerifyUrl(cert.verificationCode);

  // ── 1. Parchment background ─────────────────────────────────────────────
  pdf.setFillColor(252, 248, 240);
  pdf.rect(0, 0, W, H, 'F');
  pdf.setFillColor(255, 253, 248);
  pdf.rect(16, 13, W - 32, H - 26, 'F');

  // ── 2. Top tri-colour bar ───────────────────────────────────────────────
  pdf.setFillColor(124,  58, 237); pdf.rect(0,   0,   99, 4.5, 'F');
  pdf.setFillColor(184, 148,  63); pdf.rect(99,  0,   99, 4.5, 'F');
  pdf.setFillColor(  6, 182, 212); pdf.rect(198, 0,   99, 4.5, 'F');

  // ── 3. Bottom tri-colour bar (reversed) ─────────────────────────────────
  pdf.setFillColor(  6, 182, 212); pdf.rect(0,   H-4.5, 99, 4.5, 'F');
  pdf.setFillColor(184, 148,  63); pdf.rect(99,  H-4.5, 99, 4.5, 'F');
  pdf.setFillColor(124,  58, 237); pdf.rect(198, H-4.5, 99, 4.5, 'F');

  // ── 4. Double gold border ───────────────────────────────────────────────
  pdf.setDrawColor(184, 148, 63);
  pdf.setLineWidth(0.85);
  pdf.rect(8, 8, W - 16, H - 16);
  pdf.setLineWidth(0.2);
  pdf.rect(11, 11, W - 22, H - 22);

  // Left purple vertical accent
  pdf.setDrawColor(124, 58, 237);
  pdf.setLineWidth(2.5);
  pdf.line(8, 8, 8, H - 8);

  // Right cyan vertical accent
  pdf.setDrawColor(6, 182, 212);
  pdf.setLineWidth(2.5);
  pdf.line(W - 8, 8, W - 8, H - 8);

  // ── 5. Corner ornaments ─────────────────────────────────────────────────
  const corners = [[11,11,1,1],[W-11,11,-1,1],[11,H-11,1,-1],[W-11,H-11,-1,-1]];
  pdf.setDrawColor(184, 148, 63);
  pdf.setLineWidth(0.6);
  corners.forEach(([x, y, dx, dy]) => {
    pdf.line(x, y, x + dx * 11, y);
    pdf.line(x, y, x, y + dy * 11);
    pdf.setFillColor(184, 148, 63);
    pdf.circle(x, y, 1.1, 'F');
  });

  // ── 6. Header ───────────────────────────────────────────────────────────
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(124, 58, 237);
  pdf.text('EVENTVERSE', 20, 24);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5.5);
  pdf.setTextColor(140, 90, 20);
  pdf.text('VERIFIED ACHIEVEMENT PLATFORM', 20, 30);

  // Certificate type badge (top-right)
  const badgeText = `CERTIFICATE OF ${certLabel.toUpperCase()}`;
  const bW = badgeText.length * 1.42 + 10;
  pdf.setDrawColor(184, 148, 63);
  pdf.setFillColor(252, 248, 240);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(W - 20 - bW, 18, bW, 10, 2.5, 2.5, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5.8);
  pdf.setTextColor(124, 58, 237);
  pdf.text(badgeText, W - 20 - bW / 2, 24.2, { align: 'center' });

  // ── 7. Gold rule with diamond ornament ──────────────────────────────────
  pdf.setDrawColor(184, 148, 63);
  pdf.setLineWidth(0.35);
  pdf.line(16, 36, CX - 6, 36);
  pdf.line(CX + 6, 36, W - 16, 36);
  // Diamond (two mirrored triangles meeting at centre)
  pdf.setFillColor(184, 148, 63);
  pdf.triangle(CX - 5, 36, CX, 33, CX + 5, 36, 'F'); // upper
  pdf.triangle(CX - 5, 36, CX, 39, CX + 5, 36, 'F'); // lower

  // ── 8. "THIS IS TO CERTIFY THAT" ────────────────────────────────────────
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(130, 110, 155);
  pdf.text('THIS IS TO CERTIFY THAT', CX, 50, { align: 'center' });

  // ── 9. Recipient name ────────────────────────────────────────────────────
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(30);
  pdf.setTextColor(30, 27, 75);
  const nameLines = pdf.splitTextToSize(recipientName, 210);
  pdf.text(nameLines, CX, 67, { align: 'center' });
  const nameEndY = 67 + (nameLines.length - 1) * 11;

  // ── 10. Gold ornament divider after name ─────────────────────────────────
  const ornY = nameEndY + 8;
  pdf.setDrawColor(184, 148, 63);
  pdf.setLineWidth(0.5);
  pdf.line(CX - 58, ornY, CX - 7, ornY);
  pdf.line(CX + 7,  ornY, CX + 58, ornY);
  pdf.setFillColor(184, 148, 63);
  pdf.triangle(CX - 5, ornY, CX, ornY - 3.5, CX + 5, ornY, 'F');
  pdf.triangle(CX - 5, ornY, CX, ornY + 3.5, CX + 5, ornY, 'F');

  // ── 11. "has successfully participated in" ───────────────────────────────
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(110, 100, 130);
  pdf.text('has successfully participated in', CX, ornY + 14, { align: 'center' });

  // ── 12. Event name ───────────────────────────────────────────────────────
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(30, 27, 75);
  const evLines = pdf.splitTextToSize(eventTitle, 220);
  const evY = ornY + 26;
  pdf.text(evLines, CX, evY, { align: 'center' });
  const evEndY = evY + (evLines.length - 1) * 8.5;

  // ── 13. Category pill & date ─────────────────────────────────────────────
  let bY = evEndY + 9;

  if (cert.event?.category) {
    const cat = cert.event.category.toUpperCase();
    const cW  = cat.length * 1.85 + 12;
    pdf.setDrawColor(124, 58, 237);
    pdf.setFillColor(245, 243, 255);
    pdf.setLineWidth(0.25);
    pdf.roundedRect(CX - cW / 2, bY, cW, 8, 3, 3, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(124, 58, 237);
    pdf.text(cat, CX, bY + 5.5, { align: 'center' });
    bY += 13;
  }

  if (eventDate) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(110, 100, 130);
    pdf.text(`Held on  ${eventDate}`, CX, bY, { align: 'center' });
    bY += 6;
  }

  // ── 14. Footer thin rule ─────────────────────────────────────────────────
  const footerRuleY = Math.max(bY + 10, 157);
  pdf.setDrawColor(184, 148, 63);
  pdf.setLineWidth(0.25);
  pdf.line(16, footerRuleY, W - 16, footerRuleY);

  // Footer zone: footerRuleY+4  →  H-20  (bottom border+bar)
  const ftY = footerRuleY + 4;
  const ftH = (H - 20) - ftY; // available height for footer content

  // ── 15. Left column — Official Seal + Signature ──────────────────────────
  const sealCX = 52;
  const sealCY = ftY + ftH / 2;
  const sealR  = Math.min(ftH / 2 - 2, 13);

  pdf.setDrawColor(184, 148, 63);
  pdf.setLineWidth(0.65);
  pdf.circle(sealCX, sealCY, sealR + 2);
  pdf.setLineWidth(0.15);
  pdf.circle(sealCX, sealCY, sealR + 0.4);
  pdf.setFillColor(88, 28, 200);
  pdf.circle(sealCX, sealCY, sealR, 'F');
  pdf.setFillColor(124, 58, 237);
  pdf.circle(sealCX, sealCY, sealR - 2, 'F');
  // Rays
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    pdf.setDrawColor(184, 148, 63);
    pdf.setLineWidth(0.35);
    pdf.line(
      sealCX + Math.cos(a) * (sealR - 1.5), sealCY + Math.sin(a) * (sealR - 1.5),
      sealCX + Math.cos(a) * (sealR + 0.4), sealCY + Math.sin(a) * (sealR + 0.4),
    );
  }
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5.5);
  pdf.setTextColor(255, 224, 120);
  pdf.text('VERIFIED', sealCX, sealCY + 1.5, { align: 'center' });
  pdf.setFontSize(3.5);
  pdf.setTextColor(210, 185, 110);
  pdf.text('EVENTVERSE', sealCX, sealCY + 5.5, { align: 'center' });

  // Signature line
  const sigY = Math.min(sealCY + sealR + 6, H - 23);
  pdf.setDrawColor(184, 148, 63);
  pdf.setLineWidth(0.3);
  pdf.line(sealCX - 22, sigY, sealCX + 22, sigY);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(130, 110, 145);
  pdf.text('Authorized Signatory', sealCX, sigY + 4.5, { align: 'center' });
  pdf.text('EventVerse Platform',  sealCX, sigY + 9,   { align: 'center' });

  // ── 16. Centre column — issued date & verify URL ─────────────────────────
  const ctY = ftY + 4;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 90, 130);
  if (issuedDate) {
    pdf.text(`Issued: ${issuedDate}`, CX, ctY, { align: 'center' });
  }
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5.5);
  pdf.setTextColor(140, 120, 165);
  const urlLines = pdf.splitTextToSize(`Verify: ${verifyUrl}`, 110);
  pdf.text(urlLines, CX, ctY + 9, { align: 'center' });

  // ── 17. Right column — QR code ───────────────────────────────────────────
  const qrSz = Math.min(ftH - 6, 32);  // fits inside footer height
  const qrCX = W - 52;
  const qrX  = qrCX - qrSz / 2;
  const qrY  = ftY + (ftH - qrSz) / 2 - 1;

  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(184, 148, 63);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(qrX - 2.5, qrY - 2.5, qrSz + 5, qrSz + 5, 1.5, 1.5, 'FD');
  pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSz, qrSz);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5.5);
  pdf.setTextColor(130, 110, 145);
  pdf.text('SCAN TO VERIFY', qrCX, qrY + qrSz + 5, { align: 'center' });
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5);
  pdf.setTextColor(100, 80, 175);
  pdf.text(cert.verificationCode, qrCX, qrY + qrSz + 10, { align: 'center' });

  return pdf;
}

// ─── Certificate Preview Card ─────────────────────────────────────────────────

const CertificateCard = ({ cert, userName }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrReady,   setQrReady  ] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const verifyUrl     = getVerifyUrl(cert.verificationCode);
  const recipientName = cert.user?.name || userName || 'Participant';
  const eventTitle    = cert.event?.title || 'EventVerse Event';
  const certType      = cert.type || 'participation';
  const certLabel     = CERT_TYPE_LABELS[certType] || 'Participation';
  const eventDate     = cert.event?.startDate
    ? format(new Date(cert.event.startDate), 'MMMM dd, yyyy') : '';
  const issuedDate    = cert.issuedAt
    ? format(new Date(cert.issuedAt), 'MMMM dd, yyyy') : eventDate;

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      width: 300, margin: 2,
      color: { dark: '#1e1b4b', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    })
      .then((url) => { setQrDataUrl(url); setQrReady(true); })
      .catch(console.error);
  }, [verifyUrl]);

  const handleDownload = async () => {
    if (downloading) return;
    if (!qrReady) { toast.error('QR code is still loading — please wait.'); return; }
    setDownloading(true);
    try {
      const pdf = await buildCertificatePDF(cert, recipientName, qrDataUrl);
      pdf.save(`Certificate-${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      toast.success('Certificate downloaded!');
    } catch (e) {
      console.error(e);
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // ── Inline style tokens ──
  const cream  = 'linear-gradient(150deg, #fdfaf3 0%, #f5efe2 100%)';
  const gold   = '#b8943f';
  const purple = '#7c3aed';
  const dark   = '#1e1b4b';
  const gray   = '#6b7280';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* ── Certificate Preview ── */}
      <div style={{
        background: cream,
        border: `2px solid rgba(184,148,63,0.55)`,
        borderRadius: 12,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Georgia','Times New Roman',serif",
        padding: '1.4rem 1.5rem 1.5rem',
      }}>
        {/* Accent bars */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:5, background:'linear-gradient(90deg,#7c3aed 0%,#b8943f 50%,#06b6d4 100%)' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:5, background:'linear-gradient(90deg,#06b6d4 0%,#b8943f 50%,#7c3aed 100%)' }} />
        <div style={{ position:'absolute', top:5, bottom:5, left:0, width:4, background:purple }} />
        <div style={{ position:'absolute', top:5, bottom:5, right:0, width:4, background:'#06b6d4' }} />
        {/* Inner frame line */}
        <div style={{ position:'absolute', inset:11, border:'1px solid rgba(184,148,63,0.25)', borderRadius:6, pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1 }}>

          {/* Header row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.6rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <div style={{ width:28, height:28, background:'linear-gradient(135deg,#7c3aed,#06b6d4)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🎓</div>
              <div>
                <div style={{ fontSize:'0.62rem', fontWeight:800, color:purple, letterSpacing:'0.18em', fontFamily:'Arial,sans-serif' }}>EVENTVERSE</div>
                <div style={{ fontSize:'0.37rem', color:'#92400e', letterSpacing:'0.1em', fontFamily:'Arial,sans-serif' }}>VERIFIED PLATFORM</div>
              </div>
            </div>
            <div style={{ padding:'2px 10px', borderRadius:20, border:`1px solid ${gold}`, fontSize:'0.42rem', fontWeight:700, color:purple, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'Arial,sans-serif' }}>
              Certificate of {certLabel}
            </div>
          </div>

          {/* Gold rule with diamond */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:'0.85rem' }}>
            <div style={{ flex:1, height:1, background:`linear-gradient(90deg, transparent, ${gold})` }} />
            <div style={{ width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderBottom:`8px solid ${gold}`, transform:'translateY(-4px)' }} />
            <div style={{ width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:`8px solid ${gold}`, transform:'translateY(4px)', marginLeft:-10 }} />
            <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${gold}, transparent)` }} />
          </div>

          {/* Main centred content */}
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'0.5rem', color:'#7c6b8a', letterSpacing:'0.22em', textTransform:'uppercase', fontFamily:'Arial,sans-serif', marginBottom:'0.45rem' }}>
              This is to certify that
            </div>

            {/* Recipient name */}
            <div style={{ fontSize:'1.7rem', fontWeight:700, color:dark, lineHeight:1.1, marginBottom:'0.55rem', wordBreak:'break-word' }}>
              {recipientName}
            </div>

            {/* Gold ornament */}
            <div style={{ display:'flex', alignItems:'center', gap:6, margin:'0 auto 0.55rem', width:'60%' }}>
              <div style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${gold})` }} />
              <span style={{ color:gold, fontSize:12, lineHeight:1 }}>✦</span>
              <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${gold},transparent)` }} />
            </div>

            <div style={{ fontSize:'0.56rem', color:gray, fontFamily:'Arial,sans-serif', marginBottom:'0.4rem' }}>
              has successfully participated in
            </div>

            <div style={{ fontSize:'1.05rem', fontWeight:700, color:dark, lineHeight:1.2, marginBottom:'0.35rem', wordBreak:'break-word' }}>
              {eventTitle}
            </div>

            {cert.event?.category && (
              <div style={{ display:'inline-block', padding:'2px 10px', borderRadius:20, background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', fontSize:'0.44rem', color:purple, fontWeight:700, fontFamily:'Arial,sans-serif', letterSpacing:'0.1em', marginBottom:'0.3rem' }}>
                {cert.event.category.toUpperCase()}
              </div>
            )}

            {eventDate && (
              <div style={{ fontSize:'0.52rem', color:gray, fontFamily:'Arial,sans-serif' }}>
                Held on {eventDate}
              </div>
            )}
          </div>

          {/* Thin gold separator */}
          <div style={{ height:1, background:`linear-gradient(90deg,transparent,${gold},transparent)`, margin:'1rem 0 0.9rem' }} />

          {/* Footer: 3 columns */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem' }}>

            {/* Left: Seal */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.35rem', minWidth:80 }}>
              <div style={{
                width:52, height:52, borderRadius:'50%',
                background:'radial-gradient(circle at 38% 35%, #7c3aed, #3b0764)',
                border:`2px solid ${gold}`,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                boxShadow:'0 3px 14px rgba(124,58,237,0.4), 0 0 0 4px rgba(184,148,63,0.12)',
              }}>
                <div style={{ fontSize:16 }}>🏅</div>
                <div style={{ fontSize:'0.27rem', color:'#fde68a', fontWeight:700, letterSpacing:'0.06em', fontFamily:'Arial,sans-serif' }}>VERIFIED</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ width:64, height:1, background:gold, margin:'0 auto 3px' }} />
                <div style={{ fontSize:'0.32rem', color:gray, fontFamily:'Arial,sans-serif' }}>Authorized Signatory</div>
                <div style={{ fontSize:'0.3rem', color:'#9ca3af', fontFamily:'Arial,sans-serif' }}>EventVerse Platform</div>
              </div>
            </div>

            {/* Centre: issue info */}
            <div style={{ flex:1, textAlign:'center' }}>
              {issuedDate && (
                <div style={{ fontSize:'0.52rem', fontWeight:700, color:'#6b5fa0', fontFamily:'Arial,sans-serif', marginBottom:4 }}>
                  Issued: {issuedDate}
                </div>
              )}
              <div style={{ fontSize:'0.38rem', color:'#9ca3af', fontFamily:'Arial,sans-serif', wordBreak:'break-all' }}>
                {verifyUrl}
              </div>
            </div>

            {/* Right: QR */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.3rem', minWidth:80 }}>
              {qrReady ? (
                <div style={{ padding:4, background:'#fff', borderRadius:6, border:`1.5px solid rgba(184,148,63,0.5)`, display:'inline-block', boxShadow:'0 2px 8px rgba(0,0,0,0.14)' }}>
                  <img src={qrDataUrl} alt="Verify QR" style={{ width:54, height:54, display:'block' }} />
                </div>
              ) : (
                <div style={{ width:62, height:62, background:'#f3f0e8', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <div className="spinner" style={{ width:16, height:16 }} />
                </div>
              )}
              <div style={{ fontSize:'0.35rem', color:gray, textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:'Arial,sans-serif' }}>
                Scan to Verify
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', gap:'0.6rem' }}>
        <button
          onClick={handleDownload}
          disabled={downloading || !qrReady}
          className="btn-primary"
          style={{ flex:1, justifyContent:'center', fontSize:'0.82rem', opacity:(downloading || !qrReady) ? 0.65 : 1 }}
        >
          {downloading
            ? <><div className="spinner" style={{ width:14, height:14, borderWidth:2 }} /> Generating PDF…</>
            : <><Download size={14} /> Download PDF</>}
        </button>
        <a
          href={verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:'inline-flex', alignItems:'center', gap:5,
            padding:'0.55rem 1rem', borderRadius:'0.6rem',
            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)',
            color:'#94a3b8', fontSize:'0.82rem', textDecoration:'none',
          }}
        >
          <ExternalLink size={13} /> Verify
        </a>
      </div>
    </div>
  );
};

// ─── Portfolio Page ───────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const { user } = useAuthStore();
  const [certificates, setCertificates] = useState([]);
  const [regs,         setRegs        ] = useState([]);
  const [loading,      setLoading     ] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [certRes, regRes] = await Promise.all([
          api.get('/certificates/my'),
          api.get('/registrations/my'),
        ]);
        setCertificates(certRes.data.certificates || []);
        setRegs(regRes.data.registrations || []);
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  const attended = regs.filter((r) => r.status === 'attended').length;
  const points   = user?.achievementPoints || attended * 10;

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:'2rem' }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'1.5rem', fontWeight:800, color:'#e2e8f0', marginBottom:4 }}>
          My Portfolio
        </h1>
        <p style={{ color:'#64748b', fontSize:'0.875rem' }}>
          {user?.name && <><span style={{ color:'#a78bfa', fontWeight:600 }}>{user.name}</span> · </>}
          Your verified achievement record
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label:'Events Attended',    value:attended,           icon:'🎯' },
          { label:'Certificates',       value:certificates.length, icon:'🏆' },
          { label:'Achievement Points', value:points,             icon:'⭐' },
          { label:'Registrations',      value:regs.length,        icon:'📋' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'1rem', padding:'1.25rem', textAlign:'center' }}>
            <div style={{ fontSize:'1.5rem', marginBottom:8 }}>{icon}</div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'1.5rem', fontWeight:800, color:'#e2e8f0' }}>{value}</div>
            <div style={{ fontSize:'0.75rem', color:'#64748b', marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Interests */}
      {user?.interests?.length > 0 && (
        <div style={{ marginBottom:'2rem' }}>
          <h2 style={{ fontSize:'1rem', fontWeight:700, color:'#e2e8f0', marginBottom:'0.75rem' }}>Interests & Skills</h2>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            {user.interests.map((i) => (
              <span key={i} className="badge badge-purple" style={{ fontSize:'0.78rem' }}>{i}</span>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      <div>
        <h2 style={{ fontSize:'1rem', fontWeight:700, color:'#e2e8f0', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <Award size={18} style={{ color:'#a78bfa' }} /> Certificates ({certificates.length})
        </h2>

        {certificates.length > 0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(400px, 1fr))', gap:'2rem' }}>
            {certificates.map((cert, i) => (
              <motion.div
                key={cert._id}
                initial={{ opacity:0, y:24 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.08 }}
              >
                <CertificateCard cert={cert} userName={user?.name} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'3rem', border:'1px dashed rgba(255,255,255,0.1)', borderRadius:'1rem', color:'#64748b' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🎓</div>
            <p style={{ fontWeight:600, color:'#94a3b8', marginBottom:4 }}>No certificates yet</p>
            <p style={{ fontSize:'0.82rem' }}>Attend events to earn verified certificates</p>
          </div>
        )}
      </div>
    </div>
  );
}
