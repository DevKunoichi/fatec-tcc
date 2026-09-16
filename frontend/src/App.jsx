import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
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
            <Route path="/" element={<SessoesPage />} />
            <Route path="/produtos" element={<ProdutosPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;