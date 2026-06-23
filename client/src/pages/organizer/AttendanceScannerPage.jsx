import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, CheckCircle, XCircle, Users, Camera } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AttendanceScannerPage() {
  const { id: eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [manualQr, setManualQr] = useState('');
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef(null);
  const html5QrScannerRef = useRef(null);

  useEffect(() => {
    api.get(`/events/${eventId}`).then(({ data }) => setEvent(data.event));
    fetchAttendance();
  }, [eventId]);

  const fetchAttendance = async () => {
    try {
      const { data } = await api.get(`/attendance/${eventId}`);
      setAttendance(data.attendance || []);
    } catch {}
  };

  const processQR = async (qrData) => {
    if (processing) return;
    setProcessing(true);
    try {
      const { data } = await api.post('/attendance/scan', { qrData, eventId });
      setLastResult({ success: true, message: 'Attendance marked! Certificate generated 🎉', user: data.attendance });
      toast.success('Attendance marked!');
      fetchAttendance();
    } catch (err) {
      const msg = err.response?.data?.message || 'Scan failed';
      setLastResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setProcessing(false);
      setTimeout(() => setLastResult(null), 4000);
    }
  };

  const startScanner = async () => {
    if (scanning) return;
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      setScanning(true);
      const scanner = new Html5QrcodeScanner('qr-scanner-region', { fps: 10, qrbox: 250 });
      scanner.render(
        (decodedText) => { processQR(decodedText); },
        () => {}
      );
      html5QrScannerRef.current = scanner;
    } catch (err) {
      toast.error('Camera not available — use manual entry below');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (html5QrScannerRef.current) {
      html5QrScannerRef.current.clear().catch(() => {});
      html5QrScannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => () => stopScanner(), []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualQr.trim()) return;
    processQR(manualQr.trim());
    setManualQr('');
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>
          QR Attendance Scanner
        </h1>
        {event && <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{event.title}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Scanner */}
        <div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={18} /> Camera Scanner
            </h2>

            {!scanning ? (
              <button onClick={startScanner} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                <QrCode size={18} /> Start Camera Scanner
              </button>
            ) : (
              <div>
                <div id="qr-scanner-region" style={{ width: '100%', borderRadius: '0.75rem', overflow: 'hidden' }} />
                <button onClick={stopScanner} className="btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem' }}>
                  Stop Scanner
                </button>
              </div>
            )}

            {/* Result feedback */}
            {lastResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '1rem', padding: '0.9rem 1.25rem', borderRadius: '0.75rem',
                  background: lastResult.success ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  border: `1px solid ${lastResult.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}
              >
                {lastResult.success ? <CheckCircle size={20} style={{ color: '#4ade80' }} /> : <XCircle size={20} style={{ color: '#f87171' }} />}
                <span style={{ fontSize: '0.875rem', color: lastResult.success ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                  {lastResult.message}
                </span>
              </motion.div>
            )}
          </div>

          {/* Manual entry */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem' }}>Manual QR Data Entry</h2>
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="input-field"
                placeholder='Paste QR JSON data...'
                value={manualQr}
                onChange={(e) => setManualQr(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary" disabled={processing} style={{ flexShrink: 0 }}>
                {processing ? '...' : 'Mark'}
              </button>
            </form>
            <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.5rem' }}>Use this if camera is unavailable</p>
          </div>
        </div>

        {/* Attendance list */}
        <div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={17} /> Attended ({attendance.length})
              </h2>
              <button onClick={fetchAttendance} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: '0.8rem' }}>↻ Refresh</button>
            </div>

            {attendance.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                <p style={{ fontSize: '0.85rem' }}>No attendance recorded yet</p>
              </div>
            ) : (
              <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {attendance.map((a, i) => (
                  <div key={a._id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                    borderRadius: '0.65rem', background: 'rgba(255,255,255,0.03)',
                    borderLeft: '2px solid #4ade80',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {a.user?.name?.[0] || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.user?.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{a.user?.department} · {a.user?.year}</div>
                    </div>
                    <CheckCircle size={16} style={{ color: '#4ade80', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
