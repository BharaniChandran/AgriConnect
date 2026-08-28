import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../i18n';
import { supabase } from '../supabaseClient';
import { API_BASE_URL } from '../apiConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('agriconnect_token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('agriconnect_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure default language flag is set to avoid redirect loops
    if (!localStorage.getItem('agriconnect_lang_set')) {
      localStorage.setItem('agriconnect_lang_set', 'true');
    }

    if (token) {
      validateSession(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const validateSession = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('agriconnect_user', JSON.stringify(userData));
        if (userData.preferred_language) {
          i18n.changeLanguage(userData.preferred_language);
        }
      } else if (response.status === 401) {
        // Only clear if token is genuinely rejected
        logout();
      }
    } catch (error) {
      console.warn('Backend sync note (using cached credentials):', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phoneOrEmail, password) => {
    setErrorState(null);
    const identifier = phoneOrEmail.trim();

    // 1. Authenticate with Supabase client directly if valid email
    if (identifier.includes('@')) {
      try {
        await supabase.auth.signInWithPassword({
          email: identifier,
          password: password
        });
      } catch (sbErr) {
        console.warn('Supabase client sign-in note:', sbErr);
      }
    }

    // 2. Authenticate with Backend API
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_or_email: identifier,
          password_or_otp: password,
          preferred_language: i18n.language || 'mr'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        localStorage.setItem('agriconnect_token', data.access_token);
        
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('agriconnect_user', JSON.stringify(data.user));
          if (data.user.preferred_language) {
            i18n.changeLanguage(data.user.preferred_language);
          }
        }
        setLoading(false);
        return { success: true, user: data.user };
      } else {
        const errData = await response.json().catch(() => ({}));
        return { success: false, error: errData.detail || 'Invalid email or password' };
      }
    } catch (e) {
      console.error('Login network error:', e);
      return { success: false, error: 'Unable to connect to server. Please check your connection.' };
    }
  };

  const register = async (userData) => {
    const identifier = (userData.email || userData.phone || '').trim();

    // 1. Sign up on Supabase Auth
    if (userData.email && userData.email.includes('@')) {
      try {
        await supabase.auth.signUp({
          email: userData.email.trim(),
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              role: userData.role || 'farmer',
              phone: userData.phone || '',
              location: userData.location || 'Nashik, Maharashtra',
              preferred_language: i18n.language || 'mr'
            }
          }
        });
      } catch (sbErr) {
        console.warn('Supabase direct signup note:', sbErr);
      }
    }

    // 2. Register on Backend API & database
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          phone_or_email: identifier,
          password_or_otp: userData.password,
          role: userData.role || 'farmer',
          location: userData.location || 'Nashik, Maharashtra',
          preferred_language: i18n.language || 'mr'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        localStorage.setItem('agriconnect_token', data.access_token);
        
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('agriconnect_user', JSON.stringify(data.user));
          if (data.user.preferred_language) {
            i18n.changeLanguage(data.user.preferred_language);
          }
        }
        setLoading(false);
        return { success: true, user: data.user };
      } else {
        const errData = await response.json().catch(() => ({}));
        return { success: false, error: errData.detail || 'Registration failed' };
      }
    } catch (e) {
      console.error('Registration network error:', e);
      return { success: false, error: 'Registration failed due to network error.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('agriconnect_token');
    localStorage.removeItem('agriconnect_user');
    navigate('/login');
  };

  const [errorState, setErrorState] = useState(null);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
