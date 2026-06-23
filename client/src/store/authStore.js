import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('ev_token', data.token);
          set({ user: data.user, token: data.token, loading: false });
          return { success: true, user: data.user };
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed';
          set({ loading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      register: async (payload) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', payload);
          localStorage.setItem('ev_token', data.token);
          set({ user: data.user, token: data.token, loading: false });
          return { success: true, user: data.user };
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed';
          set({ loading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      logout: () => {
        localStorage.removeItem('ev_token');
        set({ user: null, token: null });
      },

      updateUser: (user) => set({ user }),

      switchRole: async (role) => {
        try {
          const { data } = await api.patch('/auth/switch-role', { role });
          set({ user: data.user });
          return { success: true };
        } catch (err) {
          return { success: false };
        }
      },

      updateInterests: async (interests) => {
        try {
          const { data } = await api.patch('/auth/interests', { interests });
          set({ user: data.user });
          return { success: true };
        } catch (err) {
          return { success: false };
        }
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
        } catch {}
      },

      isAuthenticated: () => !!get().token,
      isStudent: () => get().user?.roles?.includes('student'),
      isOrganizer: () => get().user?.roles?.includes('organizer'),
      isAdmin: () => get().user?.roles?.includes('admin'),
    }),
    { name: 'ev_auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);

export default useAuthStore;
