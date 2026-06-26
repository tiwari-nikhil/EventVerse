import React, { useEffect, useState, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import api from '../api/axios';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    fetchNotifications();
  };

  const typeColor = {
    event_registered: '#4ade80',
    certificate_ready: '#a78bfa',
    organizer_approved: '#22d3ee',
    organizer_rejected: '#f87171',
    system: '#fbbf24',
    default: '#94a3b8',
  };

  /**
   * Dynamically determine if the dropdown should align right or left
   * so it never goes off the left edge of the viewport on small screens.
   */
  const getAlignStyle = () => {
    if (!ref.current) return { right: 0 };
    const rect = ref.current.getBoundingClientRect();
    const dropdownWidth = Math.min(360, window.innerWidth - 32);
    const wouldOverflowLeft = rect.right - dropdownWidth < 8;
    if (wouldOverflowLeft) {
      // Shift dropdown left so its left edge is 8px from viewport edge
      return { right: 'auto', left: `${Math.max(8 - rect.left, -(rect.width))}px` };
    }
    return { right: 0, left: 'auto' };
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative',
          background: open ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '50%',
          width: 38, height: 38,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: open ? '#a78bfa' : '#94a3b8',
          transition: 'all 0.2s',
        }}
      >
        <Bell size={17} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#7c3aed', color: 'white',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: '0.65rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 48,
          zIndex: 300,
          background: '#141424',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          /* Responsive width — never wider than screen minus 32px margin */
          width: 'min(360px, calc(100vw - 2rem))',
          ...getAlignStyle(),
        }}>
          {/* Sticky header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            position: 'sticky', top: 0,
            background: '#141424',
            zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={15} style={{ color: '#a78bfa' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0' }}>
                Notifications
              </span>
              {unread > 0 && (
                <span style={{
                  background: 'rgba(124,58,237,0.2)', color: '#a78bfa',
                  borderRadius: '9999px', padding: '0.1rem 0.5rem',
                  fontSize: '0.7rem', fontWeight: 700,
                }}>
                  {unread} new
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    fontSize: '0.72rem', color: '#a78bfa', cursor: 'pointer',
                    background: 'none', border: 'none', padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem', whiteSpace: 'nowrap',
                  }}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none', border: 'none', color: '#64748b',
                  cursor: 'pointer', padding: '0.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '0.375rem',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable notification list */}
          <div style={{
            maxHeight: 'min(400px, 60vh)',
            overflowY: 'auto',
          }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '2.5rem 1.25rem', textAlign: 'center',
                color: '#64748b', fontSize: '0.85rem',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                <p style={{ fontWeight: 500, color: '#94a3b8', marginBottom: 4 }}>No notifications yet</p>
                <p style={{ fontSize: '0.78rem' }}>We'll notify you when something happens</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  style={{
                    padding: '0.9rem 1.25rem',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: n.isRead ? 'transparent' : 'rgba(124,58,237,0.06)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(124,58,237,0.06)'}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      marginTop: 6, flexShrink: 0,
                      background: typeColor[n.type] || typeColor.default,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.83rem', fontWeight: 600,
                        color: '#e2e8f0', marginBottom: 2,
                      }}>
                        {n.title}
                      </div>
                      <div style={{
                        fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4,
                        wordBreak: 'break-word',
                      }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 4 }}>
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    {!n.isRead && (
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#7c3aed', flexShrink: 0, marginTop: 6,
                      }} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
