import api from './api';

const TOKEN_KEY = 'cinemax_token';
const USER_KEY = 'cinemax_user';

export const authService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),

  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },

  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),

  setSession: (token, usuario) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async login(email, senha) {
    const response = await api.post('/auth/login', { email, senha });
    const { token, usuario } = response.data;
    authService.setSession(token, usuario);
    return usuario;
  },

  async carregarUsuario() {
    const response = await api.get('/auth/me');
    const usuario = response.data;
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    return usuario;
  }
};