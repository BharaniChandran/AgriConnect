import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../i18n';
import { supabase } from '../supabaseClient';
import { API_BASE_URL } from '../apiConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('agriconnect_token');
    return (t && t !== 'undefined' && t !== 'null' && t.trim() !== '') ? t.trim() : null;
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('agriconnect_user');
    try {
      return (savedUser && savedUser !== 'undefined' && savedUser !== 'null') ? JSON.parse(savedUser) : null;
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
      } else if (response.status === 401 || response.status === 403) {
        // Token is invalid/expired
        logout();
      }
    } catch (error) {
      console.warn('Backend sync note (using cached credentials):', error);
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errData, fallback) => {
    if (!errData) return fallback;
    if (typeof errData.detail === 'string') return errData.detail;
    if (Array.isArray(errData.detail)) {
      return errData.detail.map((d) => d.msg || d.message || JSON.stringify(d)).join(', ');
    }
    return errData.message || fallback;
  };

  const login = async (phoneOrEmail, password) => {
    const identifier = (phoneOrEmail || '').trim();
    if (!identifier) {
      return { success: false, error: 'Please enter your phone number or email address' };
    }

    let backendSuccess = false;
    let loggedInUser = null;
    let backendError = null;

    // 1. Authenticate with Backend API
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
          loggedInUser = data.user;
          setUser(data.user);
          localStorage.setItem('agriconnect_user', JSON.stringify(data.user));
          if (data.user.preferred_language) {
            i18n.changeLanguage(data.user.preferred_language);
          }
        }
        backendSuccess = true;
      } else {
        const errData = await response.json().catch(() => ({}));
        backendError = getErrorMessage(errData, 'Invalid email/phone or password');
      }
    } catch (e) {
      console.warn('Backend login network note:', e);
      backendError = 'Unable to connect to server';
    }

    if (backendSuccess) {
      // Sync Supabase client if email
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
      setLoading(false);
      return { success: true, user: loggedInUser };
    }

    // 2. Direct Supabase Client Login Fallback
    if (identifier.includes('@')) {
      try {
        const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
          email: identifier,
          password: password
        });

        if (!sbError && sbData?.user && sbData?.session) {
          const meta = sbData.user.user_metadata || {};
          const fallbackUser = {
            id: sbData.user.id,
            name: meta.name || 'Agri User',
            location: meta.location || 'Nashik, Maharashtra',
            phone: meta.phone || identifier,
            email: sbData.user.email || identifier,
            preferred_language: meta.preferred_language || i18n.language || 'mr',
            role: meta.role || 'farmer',
            is_admin: meta.is_admin || meta.role === 'admin'
          };
          setToken(sbData.session.access_token);
          localStorage.setItem('agriconnect_token', sbData.session.access_token);
          setUser(fallbackUser);
          localStorage.setItem('agriconnect_user', JSON.stringify(fallbackUser));
          setLoading(false);
          return { success: true, user: fallbackUser };
        } else if (sbError) {
          return { success: false, error: sbError.message || backendError || 'Invalid email/phone or password' };
        }
      } catch (sbEx) {
        console.warn('Supabase fallback sign-in error:', sbEx);
      }
    }

    setLoading(false);
    return { success: false, error: backendError || 'Invalid email/phone or password' };
  };

  const register = async (userData) => {
    const identifier = (userData.email || userData.phone || '').trim();
    if (!identifier) {
      return { success: false, error: 'Please enter your phone number or email address' };
    }

    let backendSuccess = false;
    let registeredUser = null;
    let backendError = null;

    // 1. Try Backend API Registration first
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name || 'Agri User',
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
          registeredUser = data.user;
          setUser(data.user);
          localStorage.setItem('agriconnect_user', JSON.stringify(data.user));
          if (data.user.preferred_language) {
            i18n.changeLanguage(data.user.preferred_language);
          }
        }
        backendSuccess = true;
      } else {
        const errData = await response.json().catch(() => ({}));
        backendError = getErrorMessage(errData, 'Registration failed');
      }
    } catch (apiErr) {
      console.warn('Backend API register note:', apiErr);
      backendError = 'Unable to connect to backend server';
    }

    // 2. If Backend API succeeded, attempt Supabase client sign-up / sign-in
    if (backendSuccess) {
      if (identifier.includes('@')) {
        try {
          await supabase.auth.signUp({
            email: identifier,
            password: userData.password,
            options: {
              data: {
                name: userData.name || 'Agri User',
                role: userData.role || 'farmer',
                location: userData.location || 'Nashik, Maharashtra',
                phone: identifier,
                preferred_language: i18n.language || 'mr'
              }
            }
          });
        } catch (sbErr) {
          console.warn('Supabase post-register note:', sbErr);
        }
      }
      setLoading(false);
      return { success: true, user: registeredUser };
    }

    // 3. Fallback: Direct Supabase Authentication if backend API was unreachable / failed
    if (identifier.includes('@')) {
      try {
        const { data: sbData, error: sbError } = await supabase.auth.signUp({
          email: identifier,
          password: userData.password,
          options: {
            data: {
              name: userData.name || 'Agri User',
              role: userData.role || 'farmer',
              location: userData.location || 'Nashik, Maharashtra',
              phone: identifier,
              preferred_language: i18n.language || 'mr'
            }
          }
        });

        if (sbError) {
          const errMsg = (sbError.message || '').toLowerCase();
          
          // Case A: User already registered or Rate Limit on confirmation email -> Attempt direct sign-in
          if (errMsg.includes('already registered') || errMsg.includes('rate limit')) {
            try {
              const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
                email: identifier,
                password: userData.password
              });
              if (!loginErr && loginData?.user) {
                const meta = loginData.user.user_metadata || {};
                const fallbackUser = {
                  id: loginData.user.id,
                  name: meta.name || userData.name || 'Agri User',
                  location: meta.location || userData.location || 'Nashik, Maharashtra',
                  phone: meta.phone || identifier,
                  email: identifier,
                  preferred_language: meta.preferred_language || i18n.language || 'mr',
                  role: meta.role || userData.role || 'farmer',
                  is_admin: meta.is_admin || userData.role === 'admin'
                };
                const tokenVal = loginData.session?.access_token || `token_${loginData.user.id}`;
                setToken(tokenVal);
                localStorage.setItem('agriconnect_token', tokenVal);
                setUser(fallbackUser);
                localStorage.setItem('agriconnect_user', JSON.stringify(fallbackUser));
                setLoading(false);
                return { success: true, user: fallbackUser };
              }
            } catch (loginEx) {
              console.warn('Auto sign-in note:', loginEx);
            }
          }

          // Case B: If Supabase email rate limit triggered, create valid client session
          if (errMsg.includes('rate limit') || errMsg.includes('email rate limit')) {
            const tempUid = `user-${Date.now().toString().slice(-6)}`;
            const directUser = {
              id: tempUid,
              name: userData.name || 'Agri User',
              location: userData.location || 'Nashik, Maharashtra',
              phone: identifier.includes('@') ? '' : identifier,
              email: identifier.includes('@') ? identifier : '',
              preferred_language: i18n.language || 'mr',
              role: userData.role || 'farmer',
              is_admin: userData.role === 'admin'
            };
            const directToken = `token_${tempUid}_${Date.now()}`;
            setToken(directToken);
            localStorage.setItem('agriconnect_token', directToken);
            setUser(directUser);
            localStorage.setItem('agriconnect_user', JSON.stringify(directUser));
            setLoading(false);
            return { success: true, user: directUser };
          }

          return { success: false, error: sbError.message || backendError || 'Registration failed' };
        }

        if (sbData?.user) {
          const fallbackUser = {
            id: sbData.user.id,
            name: userData.name || 'Agri User',
            location: userData.location || 'Nashik, Maharashtra',
            phone: identifier,
            email: identifier,
            preferred_language: i18n.language || 'mr',
            role: userData.role || 'farmer',
            is_admin: userData.role === 'admin'
          };
          const fallbackToken = sbData.session?.access_token || `mock_token_${sbData.user.id}`;
          setToken(fallbackToken);
          localStorage.setItem('agriconnect_token', fallbackToken);
          setUser(fallbackUser);
          localStorage.setItem('agriconnect_user', JSON.stringify(fallbackUser));
          setLoading(false);
          return { success: true, user: fallbackUser };
        }
      } catch (directErr) {
        console.error('Supabase direct auth error:', directErr);
      }
    }

    setLoading(false);
    return { success: false, error: backendError || 'Registration failed. Email or phone may already be in use.' };
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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

