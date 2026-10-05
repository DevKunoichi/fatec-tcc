import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const VALOR_INGRESSO = 25.00;

const STATUS_META = {
  DISPONIVEL: { label: 'Disponível', cls: 'bg-emerald-500 cursor-pointer hover:bg-emerald-600', dot: 'bg-emerald-500' },
  RESERVADO: { label: 'Reservado', cls: 'bg-amber-400', dot: 'bg-amber-400' },
  VENDIDO: { label: 'Vendido', cls: 'bg-red-500', dot: 'bg-red-500' },
  UTILIZADO: { label: 'Utilizado', cls: 'bg-red-700', dot: 'bg-red-700' },
  INDISPONIVEL: { label: 'Indisponível', cls: 'bg-gray-400', dot: 'bg-gray-400' }
};

const fmtBRL = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const MapaAssentos = ({ sessao, open, onClose }) => {
  const [mapa, setMapa] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [nomeCliente, setNomeCliente] = useState('');
  const [etapa, setEtapa] = useState('selecao'); // 'selecao' | 'revisao' | 'sucesso'
  const [erro, setErro] = useState('');
  const [comprando, setComprando] = useState(false);
  const [ultimaCompra, setUltimaCompra] = useState(null);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set());
    setNomeCliente('');
    setEtapa('selecao');
    setErro('');
    setUltimaCompra(null);
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessao?.id]);

  const carregar = async () => {
    try {
      setErro('');
      const response = await api.get(`/sessoes/${sessao.id}/assentos`);
      setMapa(response.data);
    } catch (e) {
      setErro('Não foi possível carregar o mapa de assentos.');
      console.error('Erro ao carregar mapa:', e);
    }
  };

  const toggleSeat = (assento) => {
    if (assento.status !== 'DISPONIVEL') return;
    setSelected(prev => {
      const novo = new Set(prev);
      if (novo.has(assento.id)) novo.delete(assento.id);
      else novo.add(assento.id);
      return novo;
    });
  };

  const confirmar = async (e) => {
    e.preventDefault();
    setErro('');
    if (!nomeCliente.trim()) {
      setErro('Informe o nome do cliente.');
      return;
    }
    setComprando(true);
    try {
      const response = await api.post('/ingressos/comprar', {
        sessaoId: sessao.id,
        assentoIds: [...selected],
        nomeCliente: nomeCliente.trim()
      });
      setUltimaCompra(response.data);
      setSelected(new Set());
      setEtapa('sucesso');
      await carregar();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Erro ao comprar ingressos.';
      setErro(msg);
      console.error('Erro na compra:', error);
    } finally {
      setComprando(false);
    }
  };

  const voltarParaSelecao = () => {
    setEtapa('selecao');
    setSelected(new Set());
    setUltimaCompra(null);
  };

  const totalCompra = selected.size * VALOR_INGRESSO;

  if (!open) return null;

  const filmeNome = mapa?.filme?.titulo || sessao?.filme?.titulo || '-';
  const salaNome = mapa?.sala?.nomeNumero || sessao?.sala?.nomeNumero || '-';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <div className="text-[#1B4BA0] text-[10.5px] uppercase tracking-wider mb-1 font-bold">FASE 3 · MAPA DE ASSENTOS</div>
            <h3 className="text-lg font-bold text-[#16295B]">{filmeNome}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{salaNome} · {mapa ? `${mapa.ingressosVendidos} vendidos · ${mapa.vagasDisponiveis} vagas` : ''}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">&times;</button>
        </div>

        <div className="p-6 overflow-auto flex-1">
          {etapa === 'selecao' && (
            <>
              {erro && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3">{erro}</div>}

              {!mapa ? (
                <div className="text-center py-10 text-gray-500">Carregando mapa de assentos...</div>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="bg-gray-800 text-gray-300 text-center text-xs font-bold py-2 px-16 rounded-lg w-full max-w-md">
                      TELA DO CINEMA
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    {Object.entries(
                      mapa.assentos.reduce((acc, a) => {
                        if (!acc[a.fileira]) acc[a.fileira] = [];
                        acc[a.fileira].push(a);
                        return acc;
                      }, {})
                    ).sort(([a], [b]) => a.localeCompare(b)).map(([fileira, linha]) => (
                      <div key={fileira} className="flex items-center gap-2">
                        <span className="w-5 text-center text-xs font-bold text-gray-400">{fileira}</span>
                        <div className="flex gap-1.5">
                          {linha.sort((a, b) => a.numero - b.numero).map(a => {
                            const sel = selected.has(a.id);
                            const meta = STATUS_META[a.status] || STATUS_META.INDISPONIVEL;
                            return (
                              <button
                                key={a.id}
                                disabled={a.status !== 'DISPONIVEL'}
                                onClick={() => toggleSeat(a)}
                                title={`${a.fileira}${a.numero} · ${meta.label}`}
                                className={`w-8 h-8 rounded text-[10px] font-bold text-white transition-all ${
                                  sel ? 'bg-[#1B4BA0] ring-2 ring-[#16295B]' : meta.cls
                                } disabled:cursor-not-allowed`}
                              >
                                {a.numero}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center gap-4 mt-6 text-xs text-gray-600">
                    {Object.entries(STATUS_META).map(([st, m]) => (
                      <span key={st} className="flex items-center gap-1.5">
                        <span className={`w-3 h-3 rounded ${m.dot}`}></span> {m.label}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <div className="text-sm text-gray-700">
                      Selecionados: <strong>{selected.size}</strong> assento(s)
                      {selected.size > 0 && (
                        <span className="ml-3 text-gray-500">
                          Total: <strong className="text-[#16295B]">{fmtBRL(totalCompra)}</strong>
                        </span>
                      )}
                    </div>
                    <button
                      disabled={selected.size === 0}
                      onClick={() => { setErro(''); setEtapa('revisao'); }}
                      className="px-5 py-2 bg-[#1B4BA0] text-white rounded text-sm font-semibold hover:bg-[#16295B] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Revisar compra
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {etapa === 'revisao' && (
            <form onSubmit={confirmar}>
              {erro && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3">{erro}</div>}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-bold text-[#16295B] mb-2">Revisão da compra</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[...mapa.assentos].filter(a => selected.has(a.id)).sort((a, b) => a.fileira.localeCompare(b.fileira) || a.numero - b.numero).map(a => (
                    <span key={a.id} className="bg-[#1B4BA0] text-white rounded px-2 py-1 text-xs font-bold">
                      {a.fileira}{a.numero}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="flex justify-between"><span>Valor por ingresso (padrão)</span><span>{fmtBRL(VALOR_INGRESSO)}</span></div>
                  <div className="flex justify-between font-bold text-[#16295B]"><span>Total ({selected.size} × {fmtBRL(VALOR_INGRESSO)})</span><span>{fmtBRL(totalCompra)}</span></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do cliente</label>
                <input
                  type="text"
                  value={nomeCliente}
                  onChange={e => setNomeCliente(e.target.value)}
                  required
                  placeholder="Ex: Maria Souza"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4BA0]"
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setEtapa('selecao')} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded font-medium cursor-pointer">Voltar</button>
                <button type="submit" disabled={comprando} className="px-5 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 disabled:opacity-50 cursor-pointer">
                  {comprando ? 'Confirmando...' : `Confirmar (${fmtBRL(totalCompra)})`}
                </button>
              </div>
            </form>
          )}

          {etapa === 'sucesso' && (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🎟️</div>
              <h3 className="text-lg font-bold text-emerald-700 mb-1">Compra realizada!</h3>
              <p className="text-gray-600 text-sm mb-4">
                {ultimaCompra?.length} ingresso(s) para <strong>{filmeNome}</strong>
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-sm mx-auto text-left text-sm">
                {ultimaCompra?.map(i => (
                  <div key={i.id} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-700">Assento <strong>{i.fileira}{i.numero}</strong></span>
                    <span className="text-gray-500">{fmtBRL(i.valor)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-bold text-[#16295B]">
                  <span>Total</span>
                  <span>{fmtBRL((ultimaCompra || []).reduce((acc, i) => acc + i.valor, 0))}</span>
                </div>
              </div>
              <div className="mt-6 flex justify-center space-x-3">
                <button onClick={voltarParaSelecao} className="px-4 py-2 bg-[#1B4BA0] text-white rounded font-medium hover:bg-[#16295B] cursor-pointer">Fazer outra compra</button>
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 cursor-pointer">Fechar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapaAssentos;