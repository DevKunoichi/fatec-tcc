import React, { useState } from 'react';
import api from '../../services/api';

const BuscaFilmeModal = ({ open, onClose, onSelecionar }) => {
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  if (!open) return null;

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!busca.trim()) return;

    setCarregando(true);
    setErro('');
    setResultado(null);
    try {
      const response = await api.post('/filmes/buscar', null, { params: { titulo: busca.trim() } });
      setResultado(response.data);
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Filme nao encontrado na OMDb.';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  };

  const handleUsar = () => {
    if (!resultado) return;
    onSelecionar(resultado);
    setBusca('');
    setResultado(null);
    setErro('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-[#16295B]">Buscar Filme na OMDb</h3>
            <p className="text-xs text-gray-500 mt-0.5">Consulta o catalogo online e cadastra automaticamente.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">&times;</button>
        </div>

        <form onSubmit={handleBuscar} className="p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              required
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]"
              placeholder="Ex: O Senhor dos Aneis, Duna..."
            />
            <button
              type="submit"
              disabled={carregando}
              className="px-5 py-2 bg-[#1B4BA0] text-white rounded font-medium hover:bg-[#16295B] disabled:opacity-50 cursor-pointer"
            >
              {carregando ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>

        <div className="px-6 pb-6">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3">
              {erro}
            </div>
          )}

          {resultado && (
            <div className="flex gap-4 border border-gray-200 rounded p-4">
              {resultado.posterUrl ? (
                <img src={resultado.posterUrl} alt={resultado.titulo} className="w-20 h-28 object-cover rounded" />
              ) : (
                <div className="w-20 h-28 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs text-center px-1">
                  Sem poster
                </div>
              )}
              <div className="flex-1">
                <div className="font-bold text-[#16295B]">{resultado.titulo}</div>
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                  {resultado.classificacaoEtaria && (
                    <div><span className="font-semibold">Classificacao:</span> {resultado.classificacaoEtaria}</div>
                  )}
                  {resultado.duracaoMinutos && (
                    <div><span className="font-semibold">Duracao:</span> {resultado.duracaoMinutos} min</div>
                  )}
                  {resultado.genero && (
                    <div><span className="font-semibold">Genero:</span> {resultado.genero}</div>
                  )}
                  {resultado.diretor && (
                    <div><span className="font-semibold">Diretor:</span> {resultado.diretor}</div>
                  )}
                  {resultado.sinopse && (
                    <div className="mt-1 text-gray-600 line-clamp-3">{resultado.sinopse}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded font-medium cursor-pointer">Cancelar</button>
            {resultado && (
              <button onClick={handleUsar} className="px-4 py-2 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 cursor-pointer">
                Usar este filme
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuscaFilmeModal;