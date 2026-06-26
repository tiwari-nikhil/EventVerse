import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CheckCircle, XCircle, Users, Camera, CameraOff, RotateCcw, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AttendanceScannerPage() {
  const { id: eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [scanState, setScanState] = useState('idle'); // idle | requesting | scanning | error
  const [cameraError, setCameraError] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [manualQr, setManualQr] = useState('');
  const [processing, setProcessing] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment'=back, 'user'=front

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scannerInstanceRef = useRef(null);
  const processingRef = useRef(false);
  // Use a ref for scanState so the animation loop always sees the latest value
  const scanStateRef = useRef('idle');

  // Keep scanStateRef in sync with scanState
  const updateScanState = (state) => {
    scanStateRef.current = state;
    setScanState(state);
  };

  useEffect(() => {
    api.get(`/events/${eventId}`).then(({ data }) => setEvent(data.event)).catch(() => { });
    fetchAttendance();
    return () => stopCamera();
  }, [eventId]);

  const fetchAttendance = async () => {
    try {
      const { data } = await api.get(`/attendance/${eventId}`);
      setAttendance(data.attendance || []);
    } catch { }
  };

  const processQR = async (qrData) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    try {
      const { data } = await api.post('/attendance/scan', { qrData, eventId });
      setLastResult({ success: true, message: `Attendance marked! Certificate generated 🎉` });
      toast.success('Attendance marked!');
      fetchAttendance();
    } catch (err) {
      const msg = err.response?.data?.message || 'Scan failed';
      setLastResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setProcessing(false);
      processingRef.current = false;
      setTimeout(() => setLastResult(null), 5000);
    }
  };

  // ── Camera access using native getUserMedia + html5-qrcode decoder ──────────
  const startCamera = useCallback(async () => {
    updateScanState('requesting');
    setCameraError('');

    // 1. Check if browser supports getUserMedia
    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = window.location.protocol !== 'https:' && window.location.hostname !== 'localhost'
        ? 'Camera requires HTTPS. The app must be served over HTTPS for camera access.'
        : 'Your browser does not support camera access.';
      setCameraError(msg);
      updateScanState('error');
      return;
    }

    // 2. Request camera permission explicitly
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (err) {
      let msg = 'Camera access denied.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in your browser settings and try again.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is already in use by another app. Close it and try again.';
      } else if (err.name === 'OverconstrainedError') {
        // Try without facingMode constraint
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch {
          msg = 'Could not start camera. Try flipping the camera or refreshing.';
          setCameraError(msg);
          updateScanState('error');
          return;
        }
      } else {
        msg = `Camera error: ${err.message}`;
      }
      if (!stream) {
        setCameraError(msg);
        updateScanState('error');
        return;
      }
    }

    // 3. Store stream reference first
    streamRef.current = stream;

    // 4. Set scanning state so the video element becomes visible in the DOM
    updateScanState('scanning');

    // 5. Attach stream to video element - wait for DOM to update
    //    Use a small delay + retry mechanism to ensure videoRef.current is set
    const attachStream = () => {
      return new Promise((resolve) => {
        const tryAttach = (attempts = 0) => {
          if (videoRef.current) {
            const video = videoRef.current;
            video.srcObject = stream;
            video.setAttribute('playsinline', '');
            video.setAttribute('muted', '');
            video.muted = true;

            video.onloadedmetadata = () => {
              video.play()
                .then(resolve)
                .catch((playErr) => {
                  console.warn('Video play error:', playErr);
                  resolve(); // Continue even if autoplay fails
                });
            };

            // Also try playing immediately in case metadata is already loaded
            if (video.readyState >= 1) {
              video.play()
                .then(resolve)
                .catch(() => resolve());
            }
          } else if (attempts < 20) {
            // Retry up to 20 times (200ms total) waiting for DOM
            setTimeout(() => tryAttach(attempts + 1), 10);
          } else {
            resolve(); // Give up waiting, continue anyway
          }
        };
        tryAttach();
      });
    };

    await attachStream();

    // 6. Start QR decoding loop using html5-qrcode's Html5Qrcode engine
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const decoder = new Html5Qrcode('__qr_decode_hidden__', { verbose: false });
      scannerInstanceRef.current = decoder;

      const tick = async () => {
        // Use the ref (not closure) so we always check the current state
        if (!streamRef.current || scanStateRef.current !== 'scanning') return;
        if (!videoRef.current) {
          requestAnimationFrame(tick);
          return;
        }

        const video = videoRef.current;
        if (video.readyState < 2 || video.videoWidth === 0) {
          requestAnimationFrame(tick);
          return;
        }

        // Capture a frame from video into an offscreen canvas
        const offscreen = document.createElement('canvas');
        offscreen.width = video.videoWidth || 640;
        offscreen.height = video.videoHeight || 480;
        const ctx = offscreen.getContext('2d');
        ctx.drawImage(video, 0, 0, offscreen.width, offscreen.height);

        try {
          const blob = await new Promise(res => offscreen.toBlob(res, 'image/jpeg', 0.8));
          const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' });
          const result = await decoder.scanFileV2(file, false);
          if (result?.decodedText) {
            await processQR(result.decodedText);
            // Pause scanning for 2.5s to avoid double-scanning
            await new Promise(r => setTimeout(r, 2500));
          }
        } catch {
          // No QR found in this frame — normal, keep looping
        }

        if (streamRef.current && scanStateRef.current === 'scanning') {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    } catch {
      // html5-qrcode not available — just show video, user can use manual entry
    }
  }, [facingMode, eventId]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    updateScanState('idle');
  };

  const flipCamera = async () => {
    stopCamera();
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    // Wait for facingMode state update and camera stop before restarting
    setTimeout(() => startCamera(), 400);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualQr.trim()) return;
    processQR(manualQr.trim());
    setManualQr('');
  };

  const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>
          QR Attendance Scanner
        </h1>
        {event && <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{event.title}</p>}
      </div>

      {/* HTTPS warning */}
      {!isHttps && (
        <div style={{ marginBottom: '1.25rem', padding: '0.9rem 1.25rem', borderRadius: '0.75rem', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <AlertTriangle size={18} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fbbf24', marginBottom: 2 }}>HTTPS Required for Camera</div>
            <div style={{ fontSize: '0.8rem', color: '#92400e' }}>
              Browsers only allow camera access on HTTPS. On Vercel (production) it will work automatically. For local testing, use <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0 4px', borderRadius: 3 }}>localhost</code> — not an IP address.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

        {/* ── Camera Scanner ─────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={17} /> Camera Scanner
            </h2>

            {/* Hidden element needed by html5-qrcode decoder (never visible) */}
            <div id="__qr_decode_hidden__" style={{ display: 'none' }} />

            {/* IDLE */}
            {scanState === 'idle' && (
              <button
                onClick={startCamera}
                disabled={!isHttps}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '1rem', opacity: isHttps ? 1 : 0.5 }}
              >
                <QrCode size={18} />
                {isHttps ? 'Start Camera Scanner' : 'Camera Unavailable (needs HTTPS)'}
              </button>
            )}

            {/* REQUESTING */}
            {scanState === 'requesting' && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <div className="spinner" style={{ margin: '0 auto 1rem', width: 36, height: 36 }} />
                <p style={{ fontSize: '0.875rem' }}>Requesting camera permission…</p>
                <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: 6 }}>
                  Allow access in the browser popup that appears
                </p>
              </div>
            )}

            {/* ERROR */}
            {scanState === 'error' && (
              <div style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                  <CameraOff size={20} style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f87171', marginBottom: 4 }}>Camera Access Failed</div>
                    <div style={{ fontSize: '0.8rem', color: '#fca5a5', lineHeight: 1.5 }}>{cameraError}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={startCamera} className="btn-primary" style={{ justifyContent: 'center', fontSize: '0.85rem' }}>
                    <RotateCcw size={14} /> Try Again
                  </button>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.6 }}>
                    <strong style={{ color: '#94a3b8' }}>How to allow camera:</strong><br />
                    Chrome: Click 🔒 in the address bar → Camera → Allow<br />
                    Firefox: Click the camera icon in address bar → Allow<br />
                    Safari: Settings → Safari → Camera → Allow
                  </div>
                </div>
              </div>
            )}

            {/* SCANNING — video element is always rendered so ref is always valid,
                but only shown/styled when scanning */}
            <div style={{ display: scanState === 'scanning' ? 'block' : 'none' }}>
              {/* Live video preview */}
              <div style={{ position: 'relative', borderRadius: '0.75rem', overflow: 'hidden', background: '#000', aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Scan overlay */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ width: 200, height: 200, position: 'relative' }}>
                    {/* Corner brackets */}
                    {[
                      { top: 0, left: 0, borderTop: '3px solid #7c3aed', borderLeft: '3px solid #7c3aed', borderRadius: '4px 0 0 0' },
                      { top: 0, right: 0, borderTop: '3px solid #7c3aed', borderRight: '3px solid #7c3aed', borderRadius: '0 4px 0 0' },
                      { bottom: 0, left: 0, borderBottom: '3px solid #7c3aed', borderLeft: '3px solid #7c3aed', borderRadius: '0 0 0 4px' },
                      { bottom: 0, right: 0, borderBottom: '3px solid #7c3aed', borderRight: '3px solid #7c3aed', borderRadius: '0 0 4px 0' },
                    ].map((s, i) => (
                      <div key={i} style={{ position: 'absolute', width: 28, height: 28, ...s }} />
                    ))}
                    {/* Scanning line */}
                    <motion.div
                      animate={{ top: ['10%', '90%', '10%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)' }}
                    />
                  </div>
                </div>
                {/* Processing indicator */}
                {processing && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" style={{ width: 40, height: 40 }} />
                  </div>
                )}
              </div>

              <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', margin: '0.5rem 0 0.75rem' }}>
                Point camera at a student's QR pass
              </p>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={flipCamera} style={{ flex: 1, padding: '0.55rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <RotateCcw size={14} /> Flip Camera
                </button>
                <button onClick={stopCamera} style={{ flex: 1, padding: '0.55rem', borderRadius: '0.6rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Stop Scanner
                </button>
              </div>
            </div>

            {/* Scan result feedback */}
            <AnimatePresence>
              {lastResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: '1rem', padding: '0.9rem 1.25rem', borderRadius: '0.75rem',
                    background: lastResult.success ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    border: `1px solid ${lastResult.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                  }}
                >
                  {lastResult.success
                    ? <CheckCircle size={20} style={{ color: '#4ade80', flexShrink: 0 }} />
                    : <XCircle size={20} style={{ color: '#f87171', flexShrink: 0 }} />}
                  <span style={{ fontSize: '0.875rem', color: lastResult.success ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                    {lastResult.message}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Manual QR entry */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.25rem' }}>Manual Entry</h2>
            <p style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.85rem' }}>Paste the raw QR data string from a student's pass</p>
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="input-field"
                placeholder='{"userId":"...","eventId":"..."}'
                value={manualQr}
                onChange={(e) => setManualQr(e.target.value)}
                style={{ flex: 1, fontSize: '0.82rem' }}
              />
              <button type="submit" className="btn-primary" disabled={processing} style={{ flexShrink: 0 }}>
                {processing ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Mark'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Attendance list ─────────────────────────────── */}
        <div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={17} /> Attended ({attendance.length})
              </h2>
              <button onClick={fetchAttendance} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: '0.8rem' }}>↻ Refresh</button>
            </div>

            {attendance.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>No attendance recorded yet</p>
                <p style={{ fontSize: '0.78rem' }}>Scan a student's QR pass to mark attendance</p>
              </div>
            ) : (
              <div style={{ maxHeight: 480, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <AnimatePresence>
                  {attendance.map((a, i) => (
                    <motion.div
                      key={a._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.65rem', background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #4ade80' }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {a.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.user?.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {[a.user?.department, a.user?.year].filter(Boolean).join(' · ') || a.user?.email}
                        </div>
                      </div>
                      <CheckCircle size={16} style={{ color: '#4ade80', flexShrink: 0 }} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}