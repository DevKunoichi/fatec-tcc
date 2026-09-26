import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/layout/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import ProdutosPage from './pages/ProdutosPage';
import SessoesPage from './pages/SessoesPage';
import UsuariosPage from './pages/UsuariosPage';

function Shell() {
  const { authenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] font-sans">
      {authenticated && <Header />}
      {authenticated && <Navigation />}
      <main className={authenticated ? 'flex-1 p-10 max-w-[1520px] mx-auto w-full' : 'flex-1'}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute><ErrorBoundary><SessoesPage /></ErrorBoundary></ProtectedRoute>
          } />
          <Route path="/produtos" element={
            <ProtectedRoute><ErrorBoundary><ProdutosPage /></ErrorBoundary></ProtectedRoute>
          } />
          <Route path="/usuarios" element={
            <ProtectedRoute adminOnly><ErrorBoundary><UsuariosPage /></ErrorBoundary></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Shell />
      </Router>
    </AuthProvider>
  );
}

export default App;