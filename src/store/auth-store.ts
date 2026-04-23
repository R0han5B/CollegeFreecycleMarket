import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  checkAuth: () => void;
  initialize: () => void;
}

const getInitialAuthState = () => {
  if (typeof window === 'undefined') {
    console.log('getInitialAuthState: server side, returning loading state');
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
    };
  }

  try {
    const session = localStorage.getItem('user_session');
    console.log('getInitialAuthState: session from localStorage:', session);
    const user = session ? JSON.parse(session) : null;
    console.log('getInitialAuthState: parsed user:', user);
    const result = {
      user,
      isAuthenticated: !!user,
      isLoading: false,
    };
    console.log('getInitialAuthState: returning:', result);
    return result;
  } catch (error) {
    console.error('Error parsing user session:', error);
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialAuthState(),

  setUser: (user) => {
    console.log('setUser called with:', user);
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user_session', JSON.stringify(user));
        console.log('User saved to localStorage');
      } else {
        localStorage.removeItem('user_session');
        console.log('User removed from localStorage');
      }
    }
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
    console.log('Auth state updated:', { user, isAuthenticated: !!user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_session');
    }
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  checkAuth: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    try {
      const session = localStorage.getItem('user_session');
      const user = session ? JSON.parse(session) : null;
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking auth:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  initialize: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    try {
      const session = localStorage.getItem('user_session');
      const user = session ? JSON.parse(session) : null;
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
