import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(email, senha);
      const destino = location.state?.from || '/';
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível entrar. Verifique email e senha.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#16295B' }}>
      {/* faixa superior da marca */}
      <div className="absolute top-0 left-0 right-0" style={{ height: '9px', background: '#1B4BA0' }}></div>

      {/* detalhe decorativo */}
      <div
        className="absolute rounded-full opacity-10"
        style={{ width: 420, height: 420, background: '#1B4BA0', top: -120, right: -120 }}
      ></div>
      <div
        className="absolute rounded-full opacity-10"
        style={{ width: 320, height: 320, background: '#1B4BA0', bottom: -100, left: -100 }}
      ></div>

      <div className="relative w-full max-w-md px-6">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-6 text-center" style={{ background: '#1B4BA0' }}>
            <div className="text-white text-[26px] font-extrabold tracking-tight">CINEMAX</div>
            <div className="text-[#AFC2E6] font-mono text-[10.5px] tracking-[.22em] uppercase mt-1">
              Gerenciamento integrado
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            <div>
              <h1 className="text-xl font-extrabold text-[#16295B] m-0">Acesso ao sistema</h1>
              <p className="text-gray-500 text-sm mt-1">Entre com suas credenciais para continuar.</p>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3">
                {erro}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="usuario@cinemax.com.br"
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]"
              />
            </div>

            <div>
              <label htmlFor="login-senha" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="login-senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-2.5 rounded font-semibold text-white transition-colors cursor-pointer disabled:opacity-60"
              style={{ background: '#1B4BA0' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#16295B')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#1B4BA0')}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>

            <p className="text-[11px] text-gray-400 text-center">
              Demo: <span className="font-mono">admin@cinemax.com.br</span> / <span className="font-mono">admin123</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;