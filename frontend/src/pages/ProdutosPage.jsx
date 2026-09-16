import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ProdutosPage = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('criar'); // 'criar' ou 'editar'
  const [formData, setFormData] = useState({
    id: null,
    nome: '',
    categoria: '',
    unidade: 'Unidade',
    preco: '',
    quantidadeEstoque: '',
    estoqueMinimo: 5
  });

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, produto = null) => {
    setModalMode(mode);
    if (produto) {
      setFormData({
        id: produto.id,
        nome: produto.nome,
        categoria: produto.categoria,
        unidade: produto.unidade,
        preco: produto.preco,
        quantidadeEstoque: produto.quantidadeEstoque,
        estoqueMinimo: produto.estoqueMinimo
      });
    } else {
      setFormData({
        id: null,
        nome: '',
        categoria: 'Pipocas',
        unidade: 'Unidade',
        preco: '',
        quantidadeEstoque: '',
        estoqueMinimo: 5
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
        preco: parseFloat(formData.preco),
        quantidadeEstoque: parseInt(formData.quantidadeEstoque, 10),
        estoqueMinimo: parseInt(formData.estoqueMinimo, 10)
      };

      if (modalMode === 'criar') {
        await api.post('/produtos', payload);
      } else {
        await api.put(`/produtos/${formData.id}`, payload);
      }
      closeModal();
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto. Verifique os dados e tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/produtos/${id}`);
        fetchProdutos();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto.');
      }
    }
  };

  if (loading && produtos.length === 0) {
    return <div className="p-8 text-center">Carregando produtos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-start border-b border-gray-300 pb-5 mb-6">
        <div>
          <div className="text-[#1B4BA0] text-[10.5px] uppercase tracking-wider mb-2 font-bold">CRUD 02 · RF003 / RF004</div>
          <h1 className="text-3xl font-extrabold text-[#16295B] m-0">Produtos & estoque</h1>
          <p className="text-gray-600 mt-2">Controle do balcão de snacks.</p>
        </div>
        <button 
          onClick={() => openModal('criar')}
          className="bg-[#1B4BA0] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#16295B] transition-colors cursor-pointer"
        >
          + Novo produto
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Produto</th>
              <th className="p-4 font-semibold">Categoria</th>
              <th className="p-4 font-semibold text-right">Preço</th>
              <th className="p-4 font-semibold text-right">Estoque</th>
              <th className="p-4 font-semibold text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-gray-800">{p.nome} <span className="text-xs text-gray-500 ml-2">({p.unidade})</span></div>
                  <div className="text-xs text-gray-500 mt-1">ID: {p.id}</div>
                </td>
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{p.categoria}</span>
                </td>
                <td className="p-4 text-right text-gray-700">R$ {Number(p.preco).toFixed(2).replace('.', ',')}</td>
                <td className="p-4 text-right">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${p.statusEstoque === 'ESGOTADO' ? 'bg-red-100 text-red-700' : p.statusEstoque === 'BAIXO' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-700'}`}>
                    {p.quantidadeEstoque}
                  </span>
                </td>
                <td className="p-4 text-center space-x-3">
                  <button onClick={() => openModal('editar', p)} className="text-[#1B4BA0] hover:underline text-sm font-medium cursor-pointer">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-sm font-medium cursor-pointer">Excluir</button>
                </td>
              </tr>
            ))}
            {produtos.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Nenhum produto encontrado.
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
                {modalMode === 'criar' ? 'Novo Produto' : 'Editar Produto'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]" placeholder="Ex: Pipoca Média" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select name="categoria" value={formData.categoria} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]">
                      <option value="Pipocas">Pipocas</option>
                      <option value="Bebidas">Bebidas</option>
                      <option value="Doces">Doces</option>
                      <option value="Combos">Combos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                    <input type="text" name="unidade" value={formData.unidade} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]" placeholder="Ex: Saco 120g" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                    <input type="number" step="0.01" min="0" name="preco" value={formData.preco} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                    <input type="number" min="0" name="quantidadeEstoque" value={formData.quantidadeEstoque} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mín.</label>
                    <input type="number" min="0" name="estoqueMinimo" value={formData.estoqueMinimo} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]" />
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

export default ProdutosPage;
