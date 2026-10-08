const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getAuthToken() {
  return localStorage.getItem('esm_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('esm_token', token);
  } else {
    localStorage.removeItem('esm_token');
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('esm_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('esm_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('esm_user');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  sendOtp: (phone) => request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone })
  }),

  verifyOtp: (payload) => request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  getExams: () => request('/exams'),

  saveExam: (examData) => request('/exams', {
    method: 'POST',
    body: JSON.stringify(examData)
  }),

  deleteExam: (id) => request(`/exams/${id}`, {
    method: 'DELETE'
  })
};
