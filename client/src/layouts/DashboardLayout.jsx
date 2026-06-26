import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, Award,
  Plus, LogOut, FileText, Menu, X, UserCheck
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import NotificationBell from '../components/NotificationBell';
import RoleSwitcher from '../components/RoleSwitcher';

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/events', label: 'Discover Events', icon: Calendar },
  { to: '/student/registrations', label: 'My Registrations', icon: FileText },
  { to: '/student/portfolio', label: 'My Portfolio', icon: Award },
];

const organizerLinks = [
  { to: '/organizer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/organizer/events/new', label: 'Create Event', icon: Plus },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/organizer-requests', label: 'Org Requests', icon: UserCheck },
  { to: '/admin/users', label: 'Users', icon: Users },
];

const links = { student: studentLinks, organizer: organizerLinks, admin: adminLinks };

const SIDEBAR_WIDTH = 256; // px — matches w-64

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = links[role] || [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f1a' }}>

      {/* ── DESKTOP SIDEBAR ────────────────────────────────────────────
          Normal flex child → naturally pushes content to the right.
          Hidden on mobile via CSS media query.
      ─────────────────────────────────────────────────────────────── */}
      <aside
        className="desktop-sidebar"
        style={{
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255,255,255,0.03)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <img src="/logo.png" alt="EventVerse Logo" style={{ width: 34, height: 34, objectFit: 'contain' }} />
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#e2e8f0' }}>EventVerse</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'capitalize' }}>{role} portal</div>
          </div>
        </div>

        {/* User info */}
        <div style={{
          margin: 12, padding: '0.9rem 1rem', borderRadius: 12,
          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          {user?.roles?.length > 1 && (
            <div style={{ marginTop: 10 }}>
              <RoleSwitcher />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.5rem 0.75rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Navigation</p>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full"
            style={{ color: '#f87171' }}
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE DRAWER + BACKDROP ─────────────────────────────────
          Only rendered on small screens via CSS media query.
      ─────────────────────────────────────────────────────────────── */}
      {isMobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          }}
        />
      )}
      <aside
        className="mobile-sidebar"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          zIndex: 50, width: SIDEBAR_WIDTH,
          display: 'flex', flexDirection: 'column',
          background: '#0f0f1a',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          overflowY: 'auto',
          transform: isMobileOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_WIDTH}px)`,
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Close button inside mobile sidebar header */}
        <div style={{
          padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="EventVerse Logo" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#e2e8f0' }}>EventVerse</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'capitalize' }}>{role} portal</div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748b', padding: 4, borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div style={{
          margin: 12, padding: '0.9rem 1rem', borderRadius: 12,
          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          {user?.roles?.length > 1 && (
            <div style={{ marginTop: 10 }}>
              <RoleSwitcher />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.5rem 0.75rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Navigation</p>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={() => { handleLogout(); setIsMobileOpen(false); }}
            className="sidebar-link w-full"
            style={{ color: '#f87171' }}
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ─────────────────────────────────────────
          Takes remaining width. No margin needed — sidebar is flex child.
      ─────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <header style={{
          height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem',
          background: 'rgba(15,15,26,0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          position: 'sticky', top: 0, zIndex: 30,
          backdropFilter: 'blur(12px)',
        }}>
          {/* Left: hamburger (mobile only) + mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setIsMobileOpen(true)}
              className="mobile-menu-btn"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#94a3b8', padding: 6, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Menu size={22} />
            </button>
            <div
              className="mobile-logo"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <img src="/logo.png" alt="EventVerse Logo" style={{ width: 26, height: 26, objectFit: 'contain' }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0' }}>EventVerse</span>
            </div>
          </div>

          {/* Right: notifications + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotificationBell />
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: 'white', fontSize: 14, cursor: 'pointer',
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '2rem', minHeight: 'calc(100vh - 64px)' }} className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
