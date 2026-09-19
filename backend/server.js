// Servidor API REST Standalone (Node.js) - Executa imediatamente sem dependencias externas
// Replica o contrato REST do Spring Boot (produtos, filmes, salas, sessoes)
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 8080;

const sessoesEstado = {
  DISPONIVEL: 'DISPONIVEL',
  LOTADA: 'LOTADA',
  CANCELADA: 'CANCELADA',
  ENCERRADA: 'ENCERRADA'
};

const produtos = [
  { id: 1, nome: "Pipoca Grande Salgada", categoria: "Pipocas", unidade: "Balde 200g", preco: 24.00, quantidadeEstoque: 45, estoqueMinimo: 10, statusEstoque: "NORMAL", dataCadastro: new Date().toISOString() },
  { id: 2, nome: "Pipoca Média Manteiga", categoria: "Pipocas", unidade: "Saco 120g", preco: 18.50, quantidadeEstoque: 8, estoqueMinimo: 10, statusEstoque: "BAIXO", dataCadastro: new Date().toISOString() },
  { id: 3, nome: "Coca-Cola Lata 350ml", categoria: "Bebidas", unidade: "Lata", preco: 9.00, quantidadeEstoque: 80, estoqueMinimo: 20, statusEstoque: "NORMAL", dataCadastro: new Date().toISOString() },
  { id: 4, nome: "Água Mineral s/ Gás 500ml", categoria: "Bebidas", unidade: "Garrafa", preco: 6.00, quantidadeEstoque: 50, estoqueMinimo: 15, statusEstoque: "NORMAL", dataCadastro: new Date().toISOString() },
  { id: 5, nome: "Chocolate Confete 80g", categoria: "Doces", unidade: "Pacote", preco: 12.00, quantidadeEstoque: 35, estoqueMinimo: 8, statusEstoque: "NORMAL", dataCadastro: new Date().toISOString() },
  { id: 6, nome: "Nachos com Queijo Cheddar", categoria: "Combos", unidade: "Porção", preco: 28.00, quantidadeEstoque: 0, estoqueMinimo: 5, statusEstoque: "ESGOTADO", dataCadastro: new Date().toISOString() },
  { id: 7, nome: "Combo Clássico (Pipoca G + Refri)", categoria: "Combos", unidade: "Combo", preco: 32.00, quantidadeEstoque: 20, estoqueMinimo: 5, statusEstoque: "NORMAL", dataCadastro: new Date().toISOString() }
];

let nextId = 8;

const filmes = [
  { id: 1, titulo: "O Auto da Compadecida 2", classificacaoEtaria: "14", duracaoMinutos: 124, sinopse: "Joao Grilo e Chico retornam para novas aventuras no Nordeste.", genero: "Comedia, Aventura", posterUrl: null, diretor: null, imdbId: null, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() },
  { id: 2, titulo: "Duna: Parte 2", classificacaoEtaria: "12", duracaoMinutos: 166, sinopse: "Paul Atreides se une aos Fremen e busca vinganca contra os Harkonnen.", genero: "Ficcao, Aventura, Drama", posterUrl: null, diretor: null, imdbId: null, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() },
  { id: 3, titulo: "Deadpool & Wolverine", classificacaoEtaria: "18", duracaoMinutos: 128, sinopse: "Wolverine e Deadpool unem forcas em uma aventura pelo multiverso.", genero: "Acao, Comedia, Ficcao", posterUrl: null, diretor: null, imdbId: null, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() }
];
let nextFilmeId = 4;

const salas = [
  { id: 1, nomeNumero: "Sala 1 - Padrao", capacidadeTotal: 100, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() },
  { id: 2, nomeNumero: "Sala 2 - IMAX", capacidadeTotal: 250, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() },
  { id: 3, nomeNumero: "Sala 3 - VIP", capacidadeTotal: 150, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() }
];
let nextSalaId = 4;

// Formata em horario local (wall-clock), preservando o round-trip de datas
// "offset-naive" que o cliente envia ("YYYY-MM-DDTHH:mm"). Usar toISOString()
// (UTC) aqui deslocaria os horarios e quebraria a deteccao de conflitos.
const toLocal = (date) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
};
const hojemais = (hv) => { const d = new Date(); return toLocal(new Date(d.getTime() + hv)); };

// Sessoes normalizadas (FK por ids), espelhando o modelo JPA do backend Java.
const sessoes = [
  { id: 1, filmeId: 1, salaId: 1, dataHoraInicio: hojemais(1 * 3600e3), dataHoraFim: hojemais(3 * 3600e3 + 4 * 60e3), status: sessoesEstado.DISPONIVEL, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() },
  { id: 2, filmeId: 2, salaId: 2, dataHoraInicio: hojemais(4 * 3600e3), dataHoraFim: hojemais(6 * 3600e3 + 46 * 60e3), status: sessoesEstado.DISPONIVEL, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() },
  { id: 3, filmeId: 3, salaId: 3, dataHoraInicio: hojemais(7 * 3600e3), dataHoraFim: hojemais(9 * 3600e3 + 8 * 60e3), status: sessoesEstado.ENCERRADA, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() }
];
let nextSessaoId = 4;

function updateStatus(p) {
  if (p.quantidadeEstoque <= 0) p.statusEstoque = "ESGOTADO";
  else if (p.quantidadeEstoque <= p.estoqueMinimo) p.statusEstoque = "BAIXO";
  else p.statusEstoque = "NORMAL";
}

// Projeta a sessao no mesmo shape do SessaoResponseDTO do Java (filme/sala aninhados).
function enriquecerSessao(s) {
  const filme = filmes.find(f => f.id === s.filmeId);
  const sala = salas.find(sl => sl.id === s.salaId);
  const ingressosVendidos = 0; // Ingressos implementados em fase futura.
  return {
    id: s.id,
    filme: filme || null,
    sala: sala || null,
    dataHoraInicio: s.dataHoraInicio,
    dataHoraFim: s.dataHoraFim,
    status: s.status,
    ingressosVendidos,
    vagasDisponiveis: sala ? sala.capacidadeTotal - ingressosVendidos : 0,
    dataCadastro: s.dataCadastro,
    dataAtualizacao: s.dataAtualizacao
  };
}

// Verifica sobreposicao de horario na mesma sala, ignorando idSelf (para PUT).
function sessaoConflitante(salaId, inicioMs, fimMs, idSelf) {
  return sessoes.some(s =>
    s.id !== idSelf &&
    s.salaId === salaId &&
    s.status !== sessoesEstado.CANCELADA &&
    Date.parse(s.dataHoraInicio) < fimMs &&
    Date.parse(s.dataHoraFim) > inicioMs
  );
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // JSON helper
  const sendJson = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  };

  // 1. GET /api/produtos
  if (pathname === '/api/produtos' && req.method === 'GET') {
    const { busca, categoria } = parsedUrl.query;
    let list = [...produtos];
    if (categoria) {
      list = list.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
    }
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter(p => p.nome.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
    }
    return sendJson(200, list);
  }

  // 2. GET /api/produtos/:id
  const matchId = pathname.match(/^\/api\/produtos\/(\d+)$/);
  if (matchId && req.method === 'GET') {
    const id = parseInt(matchId[1], 10);
    const item = produtos.find(p => p.id === id);
    if (!item) return sendJson(404, { error: "Produto não encontrado", id });
    return sendJson(200, item);
  }

  // Sessoes: GET /api/sessoes
  if (pathname === '/api/sessoes' && req.method === 'GET') {
    return sendJson(200, sessoes.map(enriquecerSessao));
  }

  // Sessoes: GET /api/sessoes/:id
  const matchSessaoId = pathname.match(/^\/api\/sessoes\/(\d+)$/);
  if (matchSessaoId && req.method === 'GET') {
    const id = parseInt(matchSessaoId[1], 10);
    const item = sessoes.find(s => s.id === id);
    if (!item) return sendJson(404, { error: "Sessão não encontrada", id });
    return sendJson(200, enriquecerSessao(item));
  }

  // Filmes: GET /api/filmes (suporta ?termo=)
  if (pathname === '/api/filmes' && req.method === 'GET') {
    const { termo } = parsedUrl.query;
    let list = [...filmes];
    if (termo) {
      const q = termo.toLowerCase();
      list = list.filter(f => f.titulo.toLowerCase().includes(q) || (f.genero && f.genero.toLowerCase().includes(q)));
    }
    return sendJson(200, list);
  }

  // Filmes: GET /api/filmes/:id
  const matchFilmeId = pathname.match(/^\/api\/filmes\/(\d+)$/);
  if (matchFilmeId && req.method === 'GET') {
    const id = parseInt(matchFilmeId[1], 10);
    const item = filmes.find(f => f.id === id);
    if (!item) return sendJson(404, { error: "Filme não encontrado", id });
    return sendJson(200, item);
  }

  // Salas: GET /api/salas
  if (pathname === '/api/salas' && req.method === 'GET') {
    return sendJson(200, salas);
  }

  // Salas: GET /api/salas/:id
  const matchSalaId = pathname.match(/^\/api\/salas\/(\d+)$/);
  if (matchSalaId && req.method === 'GET') {
    const id = parseInt(matchSalaId[1], 10);
    const item = salas.find(s => s.id === id);
    if (!item) return sendJson(404, { error: "Sala não encontrada", id });
    return sendJson(200, item);
  }

  // Helper to read body
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let json = {};
    if (body) {
      try { json = JSON.parse(body); } catch (e) {}
    }

    // 3. POST /api/produtos
    if (pathname === '/api/produtos' && req.method === 'POST') {
      if (!json.nome || !json.categoria || json.preco === undefined) {
        return sendJson(400, { error: "Campos obrigatórios ausentes: nome, categoria, preco" });
      }
      const novo = {
        id: nextId++,
        nome: json.nome.trim(),
        categoria: json.categoria.trim(),
        unidade: json.unidade || "Unidade",
        preco: Number(json.preco),
        quantidadeEstoque: json.quantidadeEstoque !== undefined ? Number(json.quantidadeEstoque) : 0,
        estoqueMinimo: json.estoqueMinimo !== undefined ? Number(json.estoqueMinimo) : 5,
        dataCadastro: new Date().toISOString()
      };
      updateStatus(novo);
      produtos.push(novo);
      return sendJson(201, novo);
    }

    // 4. PUT /api/produtos/:id
    if (matchId && req.method === 'PUT') {
      const id = parseInt(matchId[1], 10);
      const idx = produtos.findIndex(p => p.id === id);
      if (idx === -1) return sendJson(404, { error: "Produto não encontrado para atualização" });

      produtos[idx].nome = json.nome || produtos[idx].nome;
      produtos[idx].categoria = json.categoria || produtos[idx].categoria;
      if (json.unidade) produtos[idx].unidade = json.unidade;
      if (json.preco !== undefined) produtos[idx].preco = Number(json.preco);
      if (json.quantidadeEstoque !== undefined) produtos[idx].quantidadeEstoque = Number(json.quantidadeEstoque);
      if (json.estoqueMinimo !== undefined) produtos[idx].estoqueMinimo = Number(json.estoqueMinimo);
      produtos[idx].dataAtualizacao = new Date().toISOString();
      updateStatus(produtos[idx]);
      return sendJson(200, produtos[idx]);
    }

    // 5. DELETE /api/produtos/:id
    if (matchId && req.method === 'DELETE') {
      const id = parseInt(matchId[1], 10);
      const idx = produtos.findIndex(p => p.id === id);
      if (idx === -1) return sendJson(404, { error: "Produto não encontrado para exclusão" });
      produtos.splice(idx, 1);
      res.writeHead(204);
      return res.end();
    }

    // 6. PATCH /api/produtos/:id/estoque
    const matchEstoque = pathname.match(/^\/api\/produtos\/(\d+)\/estoque$/);
    if (matchEstoque && req.method === 'PATCH') {
      const id = parseInt(matchEstoque[1], 10);
      const item = produtos.find(p => p.id === id);
      if (!item) return sendJson(404, { error: "Produto não encontrado" });

      const tipo = (json.tipo || '').toUpperCase();
      const qtd = Number(json.quantidade || 0);

      if (qtd <= 0) return sendJson(400, { error: "Quantidade deve ser maior que zero" });

      if (tipo === 'ENTRADA') {
        item.quantidadeEstoque += qtd;
      } else if (tipo === 'SAIDA') {
        if (item.quantidadeEstoque < qtd) {
          return sendJson(422, { error: `Estoque insuficiente! Saldo atual: ${item.quantidadeEstoque}. Solicitado: ${qtd}` });
        }
        item.quantidadeEstoque -= qtd;
      } else {
        return sendJson(400, { error: "Tipo deve ser 'ENTRADA' ou 'SAIDA'" });
      }

      item.dataAtualizacao = new Date().toISOString();
      updateStatus(item);
      return sendJson(200, item);
    }

    // Sessoes: POST /api/sessoes
    if (pathname === '/api/sessoes' && req.method === 'POST') {
      if (json.filmeId === undefined || json.salaId === undefined || !json.dataHoraInicio || !json.dataHoraFim) {
        return sendJson(400, { error: "Campos obrigatorios ausentes: filmeId, salaId, dataHoraInicio, dataHoraFim" });
      }
      const filmeId = Number(json.filmeId);
      const salaId = Number(json.salaId);
      const filme = filmes.find(f => f.id === filmeId);
      const sala = salas.find(s => s.id === salaId);
      if (!filme) return sendJson(404, { error: `Filme com ID ${filmeId} nao encontrado.` });
      if (!sala) return sendJson(404, { error: `Sala com ID ${salaId} nao encontrada.` });

      const inicioMs = Date.parse(json.dataHoraInicio);
      const fimMs = Date.parse(json.dataHoraFim);
      if (isNaN(inicioMs) || isNaN(fimMs) || fimMs <= inicioMs) {
        return sendJson(422, { error: "O fim da sessao deve ser posterior ao inicio." });
      }
      if (sessaoConflitante(salaId, inicioMs, fimMs, -1)) {
        return sendJson(422, { error: "Ja existe uma sessao nessa sala no periodo informado." });
      }

      const agora = new Date().toISOString();
      const nova = {
        id: nextSessaoId++,
        filmeId,
        salaId,
        dataHoraInicio: toLocal(new Date(inicioMs)),
        dataHoraFim: toLocal(new Date(fimMs)),
        status: json.status || sessoesEstado.DISPONIVEL,
        dataCadastro: agora,
        dataAtualizacao: agora
      };
      sessoes.push(nova);
      return sendJson(201, enriquecerSessao(nova));
    }

    // Sessoes: PUT /api/sessoes/:id
    if (matchSessaoId && req.method === 'PUT') {
      const id = parseInt(matchSessaoId[1], 10);
      const idx = sessoes.findIndex(s => s.id === id);
      if (idx === -1) return sendJson(404, { error: "Sessão não encontrada" });

      const salaId = json.salaId !== undefined ? Number(json.salaId) : sessoes[idx].salaId;
      const inicioStr = json.dataHoraInicio || sessoes[idx].dataHoraInicio;
      const fimStr = json.dataHoraFim || sessoes[idx].dataHoraFim;
      const inicioMs = Date.parse(inicioStr);
      const fimMs = Date.parse(fimStr);

      if (isNaN(inicioMs) || isNaN(fimMs) || fimMs <= inicioMs) {
        return sendJson(422, { error: "O fim da sessao deve ser posterior ao inicio." });
      }
      if (sessaoConflitante(salaId, inicioMs, fimMs, id)) {
        return sendJson(422, { error: "Ja existe uma sessao nessa sala no periodo informado." });
      }

      if (json.filmeId !== undefined) {
        const filme = filmes.find(f => f.id === Number(json.filmeId));
        if (!filme) return sendJson(404, { error: `Filme com ID ${json.filmeId} nao encontrado.` });
        sessoes[idx].filmeId = filme.id;
      }
      if (json.salaId !== undefined) {
        const sala = salas.find(s => s.id === salaId);
        if (!sala) return sendJson(404, { error: `Sala com ID ${salaId} nao encontrada.` });
        sessoes[idx].salaId = sala.id;
      }
      sessoes[idx].dataHoraInicio = toLocal(new Date(inicioMs));
      sessoes[idx].dataHoraFim = toLocal(new Date(fimMs));
      if (json.status) sessoes[idx].status = json.status;
      sessoes[idx].dataAtualizacao = new Date().toISOString();
      return sendJson(200, enriquecerSessao(sessoes[idx]));
    }

    // Sessoes: DELETE /api/sessoes/:id
    if (matchSessaoId && req.method === 'DELETE') {
      const id = parseInt(matchSessaoId[1], 10);
      const idx = sessoes.findIndex(s => s.id === id);
      if (idx === -1) return sendJson(404, { error: "Sessão não encontrada" });
      sessoes.splice(idx, 1);
      res.writeHead(204);
      return res.end();
    }

    // Filmes: POST /api/filmes (cadastro manual)
    if (pathname === '/api/filmes' && req.method === 'POST') {
      if (!json.titulo) {
        return sendJson(400, { error: "Campo obrigatorio ausente: titulo" });
      }
      const novo = {
        id: nextFilmeId++,
        titulo: json.titulo.trim(),
        classificacaoEtaria: json.classificacaoEtaria || null,
        duracaoMinutos: json.duracaoMinutos ? Number(json.duracaoMinutos) : null,
        sinopse: json.sinopse || null,
        genero: json.genero || null,
        posterUrl: json.posterUrl || null,
        diretor: json.diretor || null,
        imdbId: json.imdbId || null,
        dataCadastro: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      };
      filmes.push(novo);
      return sendJson(201, novo);
    }

    // Filmes: POST /api/filmes/buscar (simulacao da integracao OMDb no mock)
    if (pathname === '/api/filmes/buscar' && req.method === 'POST') {
      const titulo = (parsedUrl.query.titulo || json.titulo || '').trim();
      if (!titulo) {
        return sendJson(400, { error: "Informe o titulo para buscar (parametro 'titulo')" });
      }
      const existente = filmes.find(f => f.titulo.toLowerCase() === titulo.toLowerCase());
      if (existente) return sendJson(200, existente);

      const novo = {
        id: nextFilmeId++,
        titulo: titulo,
        classificacaoEtaria: json.classificacaoEtaria || "L",
        duracaoMinutos: json.duracaoMinutos ? Number(json.duracaoMinutos) : 120,
        sinopse: json.sinopse || "Sinopse obtida via OMDb (simulacao no mock).",
        genero: json.genero || "Drama",
        posterUrl: json.posterUrl || null,
        diretor: json.diretor || null,
        imdbId: json.imdbId || null,
        dataCadastro: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      };
      filmes.push(novo);
      return sendJson(200, novo);
    }

    // Filmes: DELETE /api/filmes/:id
    if (matchFilmeId && req.method === 'DELETE') {
      const id = parseInt(matchFilmeId[1], 10);
      const idx = filmes.findIndex(f => f.id === id);
      if (idx === -1) return sendJson(404, { error: "Filme não encontrado" });
      filmes.splice(idx, 1);
      res.writeHead(204);
      return res.end();
    }

    // Salas: POST /api/salas
    if (pathname === '/api/salas' && req.method === 'POST') {
      if (!json.nomeNumero || json.capacidadeTotal === undefined) {
        return sendJson(400, { error: "Campos obrigatorios ausentes: nomeNumero, capacidadeTotal" });
      }
      const nova = {
        id: nextSalaId++,
        nomeNumero: json.nomeNumero.trim(),
        capacidadeTotal: Number(json.capacidadeTotal),
        dataCadastro: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
      };
      salas.push(nova);
      return sendJson(201, nova);
    }

    // Salas: DELETE /api/salas/:id
    if (matchSalaId && req.method === 'DELETE') {
      const id = parseInt(matchSalaId[1], 10);
      const idx = salas.findIndex(s => s.id === id);
      if (idx === -1) return sendJson(404, { error: "Sala não encontrada" });
      salas.splice(idx, 1);
      res.writeHead(204);
      return res.end();
    }

    // 404 fallback
    sendJson(404, { error: "Rota não encontrada", path: pathname });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`====================================================`);
  console.log(`🎬 API REST - Sistema de Cinema (Mock Express Node)`);
  console.log(`📡 Endpoints disponíveis em http://localhost:${PORT}/api`);
  console.log(`✨ Pronto para receber requisições do frontend e Postman/Insomnia`);
  console.log(`====================================================`);
});