import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BuscaFilmeModal from '../components/filmes/BuscaFilmeModal';

const STATUS_LABEL = {
  DISPONIVEL: 'Disponível',
  LOTADA: 'Lotada',
  CANCELADA: 'Cancelada',
  ENCERRADA: 'Encerrada'
};

const STATUS_STYLE = {
  DISPONIVEL: 'bg-emerald-100 text-emerald-700',
  LOTADA: 'bg-red-100 text-red-700',
  CANCELADA: 'bg-gray-200 text-gray-600',
  ENCERRADA: 'bg-gray-200 text-gray-600'
};

const formatDateTimeLocal = (value) => (value ? String(value).slice(0, 16) : '');

const formatExibicao = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  const data = d.toLocaleDateString('pt-BR');
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${data} ${hora}`;
};

const SessoesPage = () => {
  const [sessoes, setSessoes] = useState([]);
  const [filmes, setFilmes] = useState([]);
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('criar');
  const [formData, setFormData] = useState({
    id: null,
    filmeId: '',
    salaId: '',
    dataHoraInicio: '',
    dataHoraFim: '',
    status: 'DISPONIVEL'
  });
  const [erro, setErro] = useState('');
  const [isBuscaOpen, setIsBuscaOpen] = useState(false);

  useEffect(() => {
    fetchSessoes();
    fetchFilmes();
    fetchSalas();
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

  const fetchFilmes = async () => {
    try {
      const response = await api.get('/filmes');
      setFilmes(response.data);
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
    }
  };

  const fetchSalas = async () => {
    try {
      const response = await api.get('/salas');
      setSalas(response.data);
    } catch (error) {
      console.error('Erro ao buscar salas:', error);
    }
  };

  const openModal = (mode, sessao = null) => {
    setErro('');
    setModalMode(mode);
    if (sessao) {
      setFormData({
        id: sessao.id,
        filmeId: sessao.filme?.id ?? '',
        salaId: sessao.sala?.id ?? '',
        dataHoraInicio: formatDateTimeLocal(sessao.dataHoraInicio),
        dataHoraFim: formatDateTimeLocal(sessao.dataHoraFim),
        status: sessao.status || 'DISPONIVEL'
      });
    } else {
      setFormData({
        id: null,
        filmeId: filmes.length > 0 ? filmes[0].id : '',
        salaId: salas.length > 0 ? salas[0].id : '',
        dataHoraInicio: '',
        dataHoraFim: '',
        status: 'DISPONIVEL'
      });
    }
    setIsModalOpen(true);
  };

  const handleSelecionarFilme = (filme) => {
    setFilmes(prev => (prev.some(f => f.id === filme.id) ? prev : [filme, ...prev]));
    setFormData(prev => ({ ...prev, filmeId: filme.id }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErro('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErro('');

    if (!formData.filmeId || !formData.salaId) {
      setErro('Selecione o filme e a sala da sessão.');
      return;
    }
    if (!formData.dataHoraInicio || !formData.dataHoraFim) {
      setErro('Informe o inicio e o fim da sessão.');
      return;
    }
    if (formData.dataHoraFim <= formData.dataHoraInicio) {
      setErro('O fim da sessão deve ser posterior ao inicio.');
      return;
    }

    const payload = {
      filmeId: Number(formData.filmeId),
      salaId: Number(formData.salaId),
      dataHoraInicio: formData.dataHoraInicio,
      dataHoraFim: formData.dataHoraFim,
      status: formData.status
    };

    try {
      if (modalMode === 'criar') {
        await api.post('/sessoes', payload);
      } else {
        await api.put(`/sessoes/${formData.id}`, payload);
      }
      closeModal();
      fetchSessoes();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Erro ao salvar sessão.';
      setErro(msg);
      console.error('Erro ao salvar sessão:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta sessão?')) return;
    try {
      await api.delete(`/sessoes/${id}`);
      fetchSessoes();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Erro ao excluir sessão.';
      alert(msg);
      console.error('Erro ao excluir sessão:', error);
    }
  };

  if (loading && sessoes.length === 0) {
    return <div className="p-8 text-center">Carregando sessões...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-start border-b border-gray-300 pb-5 mb-6">
        <div>
          <div className="text-[#1B4BA0] text-[10.5px] uppercase tracking-wider mb-2 font-bold">CRUD 01 · FASE 2</div>
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
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sessoes.map(s => {
              const capacidade = s.sala?.capacidadeTotal ?? 0;
              const vendidos = s.ingressosVendidos ?? 0;
              const lotada = vendidos >= capacidade;
              const pct = capacidade > 0 ? Math.min((vendidos / capacidade) * 100, 100) : 0;
              return (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-gray-800">{s.filme?.titulo || '-'}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.sala?.nomeNumero || '-'}</div>
                  </td>
                  <td className="p-4">
                    <div>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono font-bold">
                        {formatExibicao(s.dataHoraInicio)}
                      </span>
                      <span className="text-gray-400 mx-1 text-xs">até</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono font-bold">
                        {formatExibicao(s.dataHoraFim)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${lotada ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {vendidos} / {capacidade}
                      </span>
                      <div className="w-24 bg-gray-200 h-1.5 mt-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${lotada ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1">{s.vagasDisponiveis} vagas</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_STYLE[s.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[s.status] || s.status}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-3">
                    <button onClick={() => openModal('editar', s)} className="text-[#1B4BA0] hover:underline text-sm font-medium cursor-pointer">Editar</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline text-sm font-medium cursor-pointer">Excluir</button>
                  </td>
                </tr>
              );
            })}
            {sessoes.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Nenhuma sessão programada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-[#16295B]">
                {modalMode === 'criar' ? 'Nova Sessão' : 'Editar Sessão'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filme</label>
                      <select name="filmeId" value={formData.filmeId} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]">
                        {filmes.length === 0 && <option value="">Nenhum filme no catalogo</option>}
                        {filmes.map(f => (
                          <option key={f.id} value={f.id}>{f.titulo}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBuscaOpen(true)}
                      className="px-3 py-2 bg-[#E7ECF4] text-[#1B4BA0] rounded font-semibold text-sm hover:bg-[#d5deea] cursor-pointer whitespace-nowrap"
                    >
                      Buscar na OMDb
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
                  <select name="salaId" value={formData.salaId} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]">
                    {salas.length === 0 && <option value="">Nenhuma sala cadastrada</option>}
                    {salas.map(s => (
                      <option key={s.id} value={s.id}>{s.nomeNumero} ({s.capacidadeTotal} lugares)</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                    <input type="datetime-local" name="dataHoraInicio" value={formData.dataHoraInicio} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                    <input type="datetime-local" name="dataHoraFim" value={formData.dataHoraFim} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]" />
                  </div>
                </div>

                {modalMode === 'editar' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]">
                      {Object.entries(STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {erro && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3">
                  {erro}
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded font-medium cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#1B4BA0] text-white rounded font-medium hover:bg-[#16295B] cursor-pointer">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BuscaFilmeModal
        open={isBuscaOpen}
        onClose={() => setIsBuscaOpen(false)}
        onSelecionar={handleSelecionarFilme}
      />
    </div>
  );
};

export default SessoesPage;