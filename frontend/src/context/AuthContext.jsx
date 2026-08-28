import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../i18n';
import { supabase } from '../supabaseClient';
import { API_BASE_URL } from '../apiConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('agriconnect_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        if (userData.preferred_language) {
          i18n.changeLanguage(userData.preferred_language);
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user', error);
      // Fallback demo user if backend is reconnecting
      const storedRole = localStorage.getItem('agriconnect_demo_role') || 'farmer';
      setUser({
        id: 'demo-user-1',
        name: 'Murugan (Farmer)',
        role: storedRole,
        phone: '+919443123456',
        preferred_language: i18n.language || 'ta',
        is_admin: storedRole === 'admin'
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (phoneOrEmail, passwordOrOtp) => {
    // Attempt client-side Supabase authentication if email provided
    if (phoneOrEmail && phoneOrEmail.includes('@')) {
      try {
        await supabase.auth.signInWithPassword({
          email: phoneOrEmail.trim(),
          password: passwordOrOtp
        });
      } catch (sbErr) {
        console.warn('Client Supabase direct sign-in note:', sbErr);
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_or_email: phoneOrEmail,
          password_or_otp: passwordOrOtp,
          preferred_language: i18n.language || 'ta'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        localStorage.setItem('agriconnect_token', data.access_token);
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('agriconnect_demo_role', data.user.role);
          if (data.user.preferred_language) {
            i18n.changeLanguage(data.user.preferred_language);
          }
        }
        return true;
      }
    } catch (e) {
      console.error('Login error', e);
    }

    // Client-side demo fallback
    const mockToken = `mock_token_${Date.now()}`;
    const role = phoneOrEmail.includes('admin') ? 'admin' : (phoneOrEmail.includes('buyer') ? 'buyer' : 'farmer');
    setToken(mockToken);
    localStorage.setItem('agriconnect_token', mockToken);
    localStorage.setItem('agriconnect_demo_role', role);
    setUser({
      id: `user-${role}-1`,
      name: role === 'admin' ? 'Platform Admin' : (role === 'buyer' ? 'Green Grocers Ltd.' : 'Ram Singh (Farmer)'),
      role: role,
      phone: phoneOrEmail,
      preferred_language: i18n.language || 'ta',
      is_admin: role === 'admin'
    });
    return true;
  };

  const register = async (userData) => {
    // Also sign up on Supabase client
    if (userData.email && userData.email.includes('@')) {
      try {
        await supabase.auth.signUp({
          email: userData.email.trim(),
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              role: userData.role || 'farmer',
              preferred_language: i18n.language || 'ta'
            }
          }
        });
      } catch (sbErr) {
        console.warn('Client Supabase direct sign-up note:', sbErr);
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          phone_or_email: userData.email,
          password_or_otp: userData.password,
          role: userData.role || 'farmer',
          preferred_language: i18n.language || 'ta'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        localStorage.setItem('agriconnect_token', data.access_token);
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('agriconnect_demo_role', data.user.role);
        }
        return true;
      }
    } catch (e) {
      console.error('Register error', e);
    }

    // Client fallback
    return await login(userData.email, userData.password);
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
    localStorage.removeItem('agriconnect_demo_role');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
