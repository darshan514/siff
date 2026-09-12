import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiGetCurrentUser,
  apiRegisterFaceImage,
  apiLoginFaceImage,
} from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sif_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user auth session:', e);
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('sif_auth_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync session state from API on mount
  useEffect(() => {
    let mounted = true;

      const initAuth = async () => {
        try {
          const fetchedUser = await apiGetCurrentUser();
          if (mounted && fetchedUser) {
            setUser(fetchedUser);
            // Token is managed in localStorage by auth.js, just keep state in sync
            setToken(localStorage.getItem('sif_auth_token'));
          }
        } catch (err) {
          console.warn('Error fetching session on init, clearing invalid session:', err);
          if (mounted) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('sif_auth_user');
            localStorage.removeItem('sif_auth_token');
          }
        } finally {
          if (mounted) setIsLoading(false);
        }
      };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sif_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sif_auth_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('sif_auth_token', token);
    } else {
      localStorage.removeItem('sif_auth_token');
    }
  }, [token]);

  const login = async (email, password, role) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(email, password, role);
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData) => {
    setIsLoading(true);
    try {
      const res = await apiRegister(formData);
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
      setToken(null);
      localStorage.removeItem('sif_auth_user');
      localStorage.removeItem('sif_auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const registerFaceImage = async (officerId, imageBlob) => {
    try {
      await apiRegisterFaceImage(officerId, imageBlob);
      if (user) {
        setUser({ ...user, isFaceRegistered: true });
      }
      return true;
    } catch (err) {
      console.error("Face registration failed:", err);
      throw err;
    }
  };

  const loginWithFaceImage = async (imageBlob) => {
    try {
      const profile = await apiLoginFaceImage(imageBlob);
      setUser(profile);
      return profile;
    } catch (err) {
      console.error("Face login failed:", err);
      throw err;
    }
  };

  const isEmployee = user?.role === 'employee' || user?.role === 'worker';
  const isSafetyOfficer = user?.role === 'safety_officer' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        isAuthenticated: !!user,
        isEmployee,
        isSafetyOfficer,
        isLoading,
        login,
        register,
        logout,
        registerFaceImage,
        loginWithFaceImage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
