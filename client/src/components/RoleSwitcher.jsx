import React from 'react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronDown } from 'lucide-react';

const roleLabels = { student: '🎓 Student', organizer: '🎪 Organizer', admin: '⚡ Admin' };
const rolePaths = { student: '/student/dashboard', organizer: '/organizer/dashboard', admin: '/admin/dashboard' };

export default function RoleSwitcher() {
  const { user, switchRole } = useAuthStore();
  const navigate = useNavigate();

  const handleSwitch = async (role) => {
    if (role === user?.activeRole) return;
    const res = await switchRole(role);
    if (res.success) {
      toast.success(`Switched to ${roleLabels[role]}`);
      navigate(rolePaths[role]);
    }
  };

  if (!user || user.roles.length < 2) return null;

  return (
    <div style={{ position: 'relative' }}>
      <select
        value={user.activeRole}
        onChange={(e) => handleSwitch(e.target.value)}
        style={{
          width: '100%', background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '0.4rem', padding: '0.3rem 0.5rem',
          color: '#c4b5fd', fontSize: '0.75rem', cursor: 'pointer',
          outline: 'none',
        }}
      >
        {user.roles.map((r) => (
          <option key={r} value={r} style={{ background: '#141424', color: '#e2e8f0' }}>
            {roleLabels[r]}
          </option>
        ))}
      </select>
    </div>
  );
}
