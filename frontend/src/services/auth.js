import { apiClient } from './api';

/**
 * Enterprise Authentication Service for SIF AI Platform using FastAPI + SQLite.
 */

export const mapRole = (role) => {
  if (role === 'admin' || role === 'safety_officer' || role === 'Safety Officer') {
    return 'safety_officer';
  }
  return 'employee';
};

export const formatUserProfile = (profile = {}) => {
  const standardizedRole = mapRole(profile.role);

  return {
    id: profile.id,
    name: profile.name || profile.full_name || 'User',
    email: profile.email || '',
    role: standardizedRole,
    employeeId: profile.employeeId || profile.employee_id || '',
    officerId: profile.officerId || profile.employee_id || '',
    department: profile.department || 'Industrial Operations',
    company: profile.company || 'SIF Enterprise',
    designation: profile.designation || (standardizedRole === 'safety_officer' ? 'Safety Officer' : 'Employee'),
    phone: profile.phone || '',
    isFaceRegistered: !!profile.isFaceRegistered || !!profile.face_registered,
    token: profile.token || '',
  };
};

export const apiRegister = async (formData) => {
  const targetRole = mapRole(formData.role);
  const fullName = formData.name || formData.full_name || '';
  const empId = targetRole === 'safety_officer'
    ? (formData.officerId || formData.employeeId || 'SO-100')
    : (formData.employeeId || 'EMP-100');

  try {
    const payload = {
      email: formData.email,
      password: formData.password,
      name: fullName,
      role: targetRole,
      employeeId: empId,
      department: formData.department,
      company: formData.company,
      designation: formData.designation,
      phone: formData.phone,
    };
    
    const response = await apiClient.post('/api/register', payload);
    const user = formatUserProfile(response.data.user);
    const token = response.data.token;
    
    localStorage.setItem('sif_auth_token', token);

    return {
      status: 'success',
      user: user,
      token: token,
    };
  } catch (err) {
    console.error('Registration flow error:', err);
    throw new Error(err.response?.data?.detail || err.message || 'Registration failed. Please try again.');
  }
};

export const apiLogin = async (email, password, requestedRole) => {
  const targetRole = requestedRole ? mapRole(requestedRole) : null;

  try {
    const response = await apiClient.post('/api/login', { email, password, role: targetRole });
    
    const user = formatUserProfile(response.data.user);
    const token = response.data.token;

    localStorage.setItem('sif_auth_token', token);

    return {
      status: 'success',
      user: user,
      token: token,
    };
  } catch (err) {
    console.error('Login flow error:', err);
    throw new Error(err.response?.data?.detail || err.message || 'Invalid email or password. Please try again.');
  }
};

export const apiLogout = async () => {
  try {
    await apiClient.post('/api/logout');
  } catch (e) {
    console.warn('Error signing out:', e);
  } finally {
    localStorage.removeItem('sif_auth_token');
  }
};

export const apiGetCurrentUser = async () => {
  try {
    const token = localStorage.getItem('sif_auth_token');
    if (!token) return null;

    const response = await apiClient.get('/api/me');
    if (!response.data || !response.data.user) return null;
    
    return formatUserProfile(response.data.user);
  } catch (err) {
    console.warn('Error getting current user session:', err);
    return null;
  }
};

export const apiRegisterFaceImage = async (officerId, imageBlob) => {
  const formData = new FormData();
  formData.append('officerId', officerId);
  formData.append('image', imageBlob, 'face.jpg');
  const response = await apiClient.post('/api/register-face', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const apiLoginFaceImage = async (imageBlob) => {
  const formData = new FormData();
  formData.append('image', imageBlob, 'face.jpg');
  const response = await apiClient.post('/api/login-face', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  if (response.data?.token) {
    localStorage.setItem('sif_auth_token', response.data.token);
  }
  return formatUserProfile(response.data.user);
};

