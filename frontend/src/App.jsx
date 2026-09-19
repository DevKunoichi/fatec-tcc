import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import ErrorBoundary from './components/layout/ErrorBoundary';
import ProdutosPage from './pages/ProdutosPage';
import SessoesPage from './pages/SessoesPage';
import UsuariosPage from './pages/UsuariosPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#F8F9FB] font-sans">
        <Header />
        <Navigation />
        <main className="flex-1 p-10 max-w-[1520px] mx-auto w-full">
          <Routes>
            <Route path="/" element={
              <ErrorBoundary><SessoesPage /></ErrorBoundary>
            } />
            <Route path="/produtos" element={
              <ErrorBoundary><ProdutosPage /></ErrorBoundary>
            } />
            <Route path="/usuarios" element={
              <ErrorBoundary><UsuariosPage /></ErrorBoundary>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;