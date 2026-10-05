import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

// Anexa o JWT em toda requisicao autenticada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cinemax_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 -> sessao expirada/invalida: limpa e redireciona ao login (exceto no proprio login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem('cinemax_token');
      localStorage.removeItem('cinemax_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;