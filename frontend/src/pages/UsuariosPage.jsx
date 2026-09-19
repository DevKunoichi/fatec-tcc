import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PERFIL_STYLE = {
  ADMIN: 'bg-purple-100 text-purple-700',
  GERENTE: 'bg-emerald-100 text-emerald-700',
  FUNCIONARIO: 'bg-sky-100 text-sky-700'
};

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('criar'); // 'criar' ou 'editar'
  const [formData, setFormData] = useState({
    id: null,
    nome: '',
    email: '',
    senha: '',
    perfil: 'FUNCIONARIO',
    ativo: true
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const params = busca.trim() ? { params: { busca: busca.trim() } } : {};
      const response = await api.get('/usuarios', params);
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, usuario = null) => {
    setModalMode(mode);
    if (usuario) {
      setFormData({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        senha: '',
        perfil: usuario.perfil,
        ativo: usuario.ativo
      });
    } else {
      setFormData({ id: null, nome: '', email: '', senha: '', perfil: 'FUNCIONARIO', ativo: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (modalMode === 'editar' && !payload.senha) delete payload.senha;

      if (modalMode === 'criar') {
        await api.post('/usuarios', payload);
      } else {
        await api.put(`/usuarios/${formData.id}`, payload);
      }
      closeModal();
      fetchUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Erro ao salvar usuário. Verifique os dados e tente novamente.';
      alert(msg);
    }
  };

  const handleDelete = async (usuario) => {
    if (window.confirm(`Tem certeza que deseja excluir ${usuario.nome}?`)) {
      try {
        await api.delete(`/usuarios/${usuario.id}`);
        fetchUsuarios();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário.');
      }
    }
  };

  if (loading && usuarios.length === 0) {
    return <div className="p-8 text-center">Carregando usuários...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-start border-b border-gray-300 pb-5 mb-6">
        <div>
          <div className="text-[#1B4BA0] text-[10.5px] uppercase tracking-wider mb-2 font-bold">CRUD 03 · RF005 / RF006</div>
          <h1 className="text-3xl font-extrabold text-[#16295B] m-0">Usuários do sistema</h1>
          <p className="text-gray-600 mt-2">Gerenciamento de acessos e permissões.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') fetchUsuarios(); }}
            placeholder="Buscar por nome ou email..."
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]"
          />
          <button
            onClick={() => openModal('criar')}
            className="bg-[#1B4BA0] text-white px-5 py-2 rounded text-sm font-semibold hover:bg-[#16295B] transition-colors cursor-pointer"
          >
            + Novo usuário
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Usuário</th>
              <th className="p-4 font-semibold">E-mail</th>
              <th className="p-4 font-semibold">Perfil</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-gray-800">{u.nome}</div>
                  <div className="text-xs text-gray-500 mt-1">ID: {u.id}</div>
                </td>
                <td className="p-4 text-gray-700">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${PERFIL_STYLE[u.perfil] || 'bg-gray-100 text-gray-600'}`}>
                    {u.perfil}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${u.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                    {u.ativo ? 'ATIVO' : 'INATIVO'}
                  </span>
                </td>
                <td className="p-4 text-center space-x-3">
                  <button onClick={() => openModal('editar', u)} className="text-[#1B4BA0] hover:underline text-sm font-medium cursor-pointer">Editar</button>
                  <button onClick={() => handleDelete(u)} className="text-red-600 hover:underline text-sm font-medium cursor-pointer">Excluir</button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Nenhum usuário encontrado.
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
                {modalMode === 'criar' ? 'Novo Usuário' : 'Editar Usuário'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]" placeholder="Ex: Maria Souza" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]" placeholder="usuario@cinemax.com.br" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    required={modalMode === 'criar'}
                    minLength={modalMode === 'criar' ? 6 : undefined}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]"
                    placeholder={modalMode === 'editar' ? 'Deixe em branco para manter a senha atual' : 'Mínimo de 6 caracteres'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                    <select name="perfil" value={formData.perfil} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]">
                      <option value="FUNCIONARIO">Funcionário</option>
                      <option value="GERENTE">Gerente</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                      <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange} className="w-4 h-4 accent-[#1B4BA0]" />
                      Ativo
                    </label>
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

export default UsuariosPage;