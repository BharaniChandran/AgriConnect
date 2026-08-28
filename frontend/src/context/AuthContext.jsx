import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../i18n';
import { supabase } from '../supabaseClient';
import { auth as firebaseAuth, db as firestoreDb } from '../firebaseClient';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
        const localSaved = localStorage.getItem('agriconnect_user');
        if (!localSaved) {
          logout();
        }
      }
    } catch (error) {
      console.warn('Session verification fallback to offline cached user:', error);
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errData, defaultMsg) => {
    if (!errData) return defaultMsg;
    if (typeof errData.detail === 'string') return errData.detail;
    if (Array.isArray(errData.detail) && errData.detail.length > 0) {
      const firstErr = errData.detail[0];
      return firstErr.msg || defaultMsg;
    }
    return errData.message || defaultMsg;
  };

  const login = async (phoneOrEmail, password) => {
    const identifier = (phoneOrEmail || '').trim();
    if (!identifier || !password) {
      return { success: false, error: 'Please enter both your phone/email and password' };
    }

    setLoading(true);
    let backendSuccess = false;
    let loggedInUser = null;
    let backendError = null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_or_email: identifier,
          password_or_otp: password
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
    } catch (apiErr) {
      console.warn('Backend API login note:', apiErr);
      backendError = 'Unable to connect to backend server';
    }

    if (backendSuccess && loggedInUser) {
      if (identifier.includes('@')) {
        try {
          await signInWithEmailAndPassword(firebaseAuth, identifier, password).catch(() => {});
        } catch (fbErr) {
          console.warn('Firebase client sign-in note:', fbErr);
        }
      }
      setLoading(false);
      return { success: true, user: loggedInUser };
    }

    if (identifier.includes('@')) {
      try {
        const userCred = await signInWithEmailAndPassword(firebaseAuth, identifier, password);
        if (userCred && userCred.user) {
          const fbUser = userCred.user;
          const fallbackUser = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Agri User',
            location: 'Nashik, Maharashtra',
            phone: identifier.includes('@') ? '' : identifier,
            email: fbUser.email || identifier,
            preferred_language: i18n.language || 'mr',
            role: 'farmer',
            is_admin: false
          };
          const fbToken = await fbUser.getIdToken();
          setToken(fbToken);
          localStorage.setItem('agriconnect_token', fbToken);
          setUser(fallbackUser);
          localStorage.setItem('agriconnect_user', JSON.stringify(fallbackUser));
          setLoading(false);
          return { success: true, user: fallbackUser };
        }
      } catch (fbEx) {
        console.warn('Firebase fallback sign-in note:', fbEx);
      }
    }

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
        }
      } catch (sbEx) {
        console.warn('Supabase fallback sign-in note:', sbEx);
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

    if (identifier.includes('@')) {
      try {
        const userCred = await createUserWithEmailAndPassword(firebaseAuth, identifier, userData.password).catch(() => null);
        if (userCred && userCred.user) {
          await updateProfile(userCred.user, {
            displayName: userData.name || 'Agri User'
          });
          try {
            await setDoc(doc(firestoreDb, 'users', userCred.user.uid), {
              name: userData.name || 'Agri User',
              email: identifier,
              role: userData.role || 'farmer',
              location: userData.location || 'Nashik, Maharashtra',
              preferred_language: i18n.language || 'mr',
              created_at: new Date().toISOString()
            });
          } catch (fsErr) {
            console.warn('Firestore doc write note:', fsErr);
          }
        }
      } catch (fbErr) {
        console.warn('Firebase registration note:', fbErr);
      }
    }

    if (backendSuccess && registeredUser) {
      setLoading(false);
      return { success: true, user: registeredUser };
    }

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
  };

  const logout = () => {
    localStorage.removeItem('agriconnect_token');
    localStorage.removeItem('agriconnect_user');
    setToken(null);
    setUser(null);
    try {
      firebaseSignOut(firebaseAuth).catch(() => {});
    } catch {}
    try {
      supabase.auth.signOut().catch(() => {});
    } catch {}
    navigate('/login');
  };

  const updateProfileData = async (data) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('agriconnect_user', JSON.stringify(updated));

    if (data.preferred_language) {
      i18n.changeLanguage(data.preferred_language);
    }

    try {
      await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.warn('Failed to sync profile update with backend:', err);
    }
  };

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang);
    if (user) {
      updateProfileData({ preferred_language: lang });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile: updateProfileData,
        switchLanguage,
        isAuthenticated: !!token && !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
