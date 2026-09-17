import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SessoesPage = () => {
  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('criar'); // 'criar' ou 'editar'
  const [formData, setFormData] = useState({
    id: null,
    filme: '',
    sala: 'Sala 1 - Padrão',
    horario: '',
    capacidade: 100,
    ingressosVendidos: 0
  });

  useEffect(() => {
    fetchSessoes();
  }, []);

  const fetchSessoes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sessoes');
      setSessoes(response.data);
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, sessao = null) => {
    setModalMode(mode);
    if (sessao) {
      setFormData({
        id: sessao.id,
        filme: sessao.filme,
        sala: sessao.sala,
        horario: sessao.horario,
        capacidade: sessao.capacidade,
        ingressosVendidos: sessao.ingressosVendidos
      });
    } else {
      setFormData({
        id: null,
        filme: '',
        sala: 'Sala 1 - Padrão',
        horario: '',
        capacidade: 100,
        ingressosVendidos: 0
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        capacidade: parseInt(formData.capacidade, 10),
        ingressosVendidos: parseInt(formData.ingressosVendidos, 10)
      };

      if (payload.ingressosVendidos > payload.capacidade) {
        alert("A quantidade de ingressos vendidos não pode ser maior que a capacidade da sala!");
        return;
      }

      if (modalMode === 'criar') {
        await api.post('/sessoes', payload);
      } else {
        await api.put(`/sessoes/${formData.id}`, payload);
      }
      closeModal();
      fetchSessoes();
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      alert('Erro ao salvar sessão.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta sessão?')) {
      try {
        await api.delete(`/sessoes/${id}`);
        fetchSessoes();
      } catch (error) {
        console.error('Erro ao excluir sessão:', error);
        alert('Erro ao excluir sessão.');
      }
    }
  };

  if (loading && sessoes.length === 0) {
    return <div className="p-8 text-center">Carregando sessões...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-start border-b border-gray-300 pb-5 mb-6">
        <div>
          <div className="text-[#1B4BA0] text-[10.5px] uppercase tracking-wider mb-2 font-bold">CRUD 01 · IMPLEMENTADO</div>
          <h1 className="text-3xl font-extrabold text-[#16295B] m-0">Sessões de filmes</h1>
          <p className="text-gray-600 mt-2">Programação e gerenciamento de salas.</p>
        </div>
        <button 
          onClick={() => openModal('criar')}
          className="bg-[#1B4BA0] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#16295B] transition-colors cursor-pointer"
        >
          + Nova Sessão
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Filme & Sala</th>
              <th className="p-4 font-semibold">Horário</th>
              <th className="p-4 font-semibold text-center">Ocupação</th>
              <th className="p-4 font-semibold text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sessoes.map(s => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-gray-800">{s.filme}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.sala}</div>
                </td>
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono font-bold">{s.horario}</span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${s.ingressosVendidos >= s.capacidade ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {s.ingressosVendidos} / {s.capacidade}
                    </span>
                    <div className="w-24 bg-gray-200 h-1.5 mt-2 rounded-full overflow-hidden">
                       <div 
                         className={`h-full ${s.ingressosVendidos >= s.capacidade ? 'bg-red-500' : 'bg-emerald-500'}`} 
                         style={{ width: `${Math.min((s.ingressosVendidos / s.capacidade) * 100, 100)}%` }}
                       ></div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center space-x-3">
                  <button onClick={() => openModal('editar', s)} className="text-[#1B4BA0] hover:underline text-sm font-medium cursor-pointer">Editar</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline text-sm font-medium cursor-pointer">Excluir</button>
                </td>
              </tr>
            ))}
            {sessoes.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  Nenhuma sessão programada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-[#16295B]">
                {modalMode === 'criar' ? 'Nova Sessão' : 'Editar Sessão'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filme</label>
                  <input type="text" name="filme" value={formData.filme} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]" placeholder="Ex: O Senhor dos Anéis" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
                    <select name="sala" value={formData.sala} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]">
                      <option value="Sala 1 - Padrão">Sala 1 - Padrão</option>
                      <option value="Sala 2 - IMAX">Sala 2 - IMAX</option>
                      <option value="Sala 3 - VIP">Sala 3 - VIP</option>
                      <option value="Sala 4 - 3D">Sala 4 - 3D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                    <input type="time" name="horario" value={formData.horario} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade</label>
                    <input type="number" min="1" name="capacidade" value={formData.capacidade} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ingressos Vendidos</label>
                    <input type="number" min="0" name="ingressosVendidos" value={formData.ingressosVendidos} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded font-medium cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#1B4BA0] text-white rounded font-medium hover:bg-[#16295B] cursor-pointer">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessoesPage;
