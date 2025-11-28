import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ml = axios.create({
  baseURL: import.meta.env.VITE_ML,
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const authDataString = localStorage.getItem('auth');
    if (authDataString) {
      const authData = JSON.parse(authDataString);
      if (authData.token) {
        config.headers.Authorization = `Bearer ${authData.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove auth data
      localStorage.removeItem('auth');
      window.location.reload();
      window.location.href = '#/login';
    }
    return Promise.reject(error);
  }
);

export {api, ml}