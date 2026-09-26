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

// Usuarios em memoria. Obs.: a senha nunca e devolvida nas respostas (contrato igual ao Java).
const usuarios = [
  { id: 1, nome: "Administrador Cinemax", email: "admin@cinemax.com.br", senha: "admin123", perfil: "ADMIN", ativo: true, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() },
  { id: 2, nome: "Andresa Paula", email: "andresa.paula@cinemax.com.br", senha: "admin123", perfil: "GERENTE", ativo: true, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() },
  { id: 3, nome: "Rafael Lima", email: "rafael.lima@cinemax.com.br", senha: "123456", perfil: "ATENDENTE", ativo: true, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() },
  { id: 4, nome: "Beatriz Alves", email: "beatriz.alves@cinemax.com.br", senha: "123456", perfil: "ATENDENTE", ativo: true, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() },
  { id: 5, nome: "Diego Nunes", email: "diego.nunes@cinemax.com.br", senha: "123456", perfil: "ATENDENTE", ativo: false, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() },
  { id: 6, nome: "Maria Cliente", email: "maria.cliente@cinemax.com.br", senha: "123456", perfil: "CLIENTE", ativo: true, dataCadastro: new Date().toISOString(), dataAtualizacao: new Date().toISOString() }
];
let nextUsuarioId = 7;
const PERFIS_VALIDOS = ['ADMIN', 'GERENTE', 'ATENDENTE', 'CLIENTE'];

function toUsuarioPublico(u) {
  return { id: u.id, nome: u.nome, email: u.email, perfil: u.perfil, ativo: u.ativo, dataCadastro: u.dataCadastro, dataAtualizacao: u.dataAtualizacao };
}

// Auth mock (Fase 4): gera um JWT fake (nao assinado, apenas demo) e recupera o usuario pelo header.
function gerarTokenMock(u) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: u.email, userId: u.id, nome: u.nome, perfil: u.perfil, exp: Date.now() + 86400000
  })).toString('base64url');
  return `${header}.${payload}.mock-assinatura`;
}
function usuarioPorToken(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  const payloadB64 = h.slice(7).split('.')[1];
  if (!payloadB64) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    const u = usuarios.find(x => x.id === payload.userId);
    return u && u.ativo ? u : null;
  } catch (e) {
    return null;
  }
}

// Fase 3 - Assentos e Ingressos (espelhando o JPA: Assento pertence a Sala; Ingresso pertence a Sessao+Assento)
const VALOR_INGRESSO = 25.00;
const statusIngresso = {
  DISPONIVEL: 'DISPONIVEL',
  RESERVADO: 'RESERVADO',
  VENDIDO: 'VENDIDO',
  UTILIZADO: 'UTILIZADO',
  INDISPONIVEL: 'INDISPONIVEL'
};
const assentos = [];
const ingressos = [];
let nextAssentoId = 0;
let nextIngressoId = 0;

// Gera o grid da sala (fileiras a partir de A, ate 20 assentos por fileira) respeitando a capacidade.
function gerarAssentos(sala) {
  const cap = sala.capacidadeTotal || 0;
  if (cap <= 0) return;
  const porFileira = 20;
  const fileiras = Math.ceil(cap / porFileira);
  let restante = cap;
  for (let r = 0; r < fileiras && restante > 0; r++) {
    const fileira = String.fromCharCode(65 + r);
    const n = Math.min(porFileira, restante);
    for (let i = 1; i <= n; i++) {
      assentos.push({ id: ++nextAssentoId, salaId: sala.id, fileira, numero: i, status: 'DISPONIVEL' });
    }
    restante -= n;
  }
}
function gerarAssentosSeNecessario(sala) {
  if (!assentos.some(a => a.salaId === sala.id)) gerarAssentos(sala);
}
// Backfill para as salas do seed
salas.forEach(gerarAssentos);

function ingressosDaSessao(sessaoId) {
  return ingressos.filter(i => i.sessaoId === sessaoId);
}
function ingressosVendidosDe(sessaoId) {
  return ingressosDaSessao(sessaoId).filter(i => ['RESERVADO', 'VENDIDO', 'UTILIZADO'].includes(i.status)).length;
}
function sessaoCheia(sessao) {
  const sala = salas.find(sl => sl.id === sessao.salaId);
  return !!sala && sessao.status !== sessoesEstado.CANCELADA && ingressosVendidosDe(sessao.id) >= sala.capacidadeTotal;
}

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
  if (sessaoCheia(s)) s.status = sessoesEstado.LOTADA;
  const ingressosVendidos = ingressosVendidosDe(s.id);
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

  // Usuarios: GET /api/usuarios (suporta ?busca= nome ou email)
  if (pathname === '/api/usuarios' && req.method === 'GET') {
    const { busca } = parsedUrl.query;
    let list = [...usuarios];
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter(u => u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return sendJson(200, list.map(toUsuarioPublico));
  }

  // Usuarios: GET /api/usuarios/:id
  const matchUsuarioId = pathname.match(/^\/api\/usuarios\/(\d+)$/);
  if (matchUsuarioId && req.method === 'GET') {
    const id = parseInt(matchUsuarioId[1], 10);
    const item = usuarios.find(u => u.id === id);
    if (!item) return sendJson(404, { error: "Usuário não encontrado", id });
    return sendJson(200, toUsuarioPublico(item));
  }

  // Auth: GET /api/auth/me (usuario logado a partir do token)
  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const u = usuarioPorToken(req);
    if (!u) return sendJson(401, { status: 401, error: "Nao Autorizado", message: "Autentique-se para acessar este recurso." });
    return sendJson(200, toUsuarioPublico(u));
  }

  // Sessoes: GET /api/sessoes/:id/assentos (mapa de assentos da sessao)
  const matchSessaoAssentos = pathname.match(/^\/api\/sessoes\/(\d+)\/assentos$/);
  if (matchSessaoAssentos && req.method === 'GET') {
    const sessaoId = parseInt(matchSessaoAssentos[1], 10);
    const sessao = sessoes.find(s => s.id === sessaoId);
    if (!sessao) return sendJson(404, { error: "Sessão não encontrada", id: sessaoId });

    const sala = salas.find(sl => sl.id === sessao.salaId);
    if (!sala) return sendJson(404, { error: "Sala da sessão não encontrada" });

    const statusPorAssento = {};
    ingressosDaSessao(sessaoId).forEach(i => { statusPorAssento[i.assentoId] = i.status; });

    const assentosMapa = assentos
      .filter(a => a.salaId === sala.id)
      .sort((a, b) => a.fileira.localeCompare(b.fileira) || a.numero - b.numero)
      .map(a => ({
        id: a.id,
        fileira: a.fileira,
        numero: a.numero,
        status: statusPorAssento[a.id] || (a.status === 'INDISPONIVEL' ? statusIngresso.INDISPONIVEL : statusIngresso.DISPONIVEL)
      }));

    const vendidos = ingressosVendidosDe(sessaoId);
    return sendJson(200, {
      sessaoId: sessao.id,
      filme: filmes.find(f => f.id === sessao.filmeId) || null,
      sala,
      dataHoraInicio: sessao.dataHoraInicio,
      ingressosVendidos: vendidos,
      vagasDisponiveis: sala.capacidadeTotal - vendidos,
      assentos: assentosMapa
    });
  }

  // Assentos: GET /api/assentos (suporta ?salaId=)
  if (pathname === '/api/assentos' && req.method === 'GET') {
    const { salaId } = parsedUrl.query;
    const lista = salaId
      ? assentos.filter(a => a.salaId === Number(salaId))
      : [...assentos];
    return sendJson(200, lista);
  }

  // Assentos: GET /api/assentos/:id
  const matchAssentoId = pathname.match(/^\/api\/assentos\/(\d+)$/);
  if (matchAssentoId && req.method === 'GET') {
    const id = parseInt(matchAssentoId[1], 10);
    const item = assentos.find(a => a.id === id);
    if (!item) return sendJson(404, { error: "Assento não encontrado", id });
    return sendJson(200, item);
  }

  // Ingressos: GET /api/ingressos
  if (pathname === '/api/ingressos' && req.method === 'GET') {
    return sendJson(200, ingressos);
  }

  // Ingressos: GET /api/ingressos/sessoes/:id (ingressos da sessao)
  const matchIngressosSessao = pathname.match(/^\/api\/ingressos\/sessoes\/(\d+)$/);
  if (matchIngressosSessao && req.method === 'GET') {
    const sessaoId = parseInt(matchIngressosSessao[1], 10);
    if (!sessoes.some(s => s.id === sessaoId)) return sendJson(404, { error: "Sessão não encontrada", id: sessaoId });
    return sendJson(200, ingressosDaSessao(sessaoId));
  }

  // Ingressos: GET /api/ingressos/:id
  const matchIngressoId = pathname.match(/^\/api\/ingressos\/(\d+)$/);
  if (matchIngressoId && req.method === 'GET') {
    const id = parseInt(matchIngressoId[1], 10);
    const item = ingressos.find(i => i.id === id);
    if (!item) return sendJson(404, { error: "Ingresso não encontrado", id });
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
      gerarAssentosSeNecessario(nova);
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

    // Assentos: POST /api/assentos
    if (pathname === '/api/assentos' && req.method === 'POST') {
      if (!json.salaId || !json.fileira || json.numero === undefined) {
        return sendJson(400, { error: "Campos obrigatorios ausentes: salaId, fileira, numero" });
      }
      const salaId = Number(json.salaId);
      if (!salas.some(s => s.id === salaId)) return sendJson(404, { error: `Sala com ID ${salaId} nao encontrada.` });
      const fileira = String(json.fileira).trim().toUpperCase();
      if (fileira.length > 5) return sendJson(422, { error: "A fileira deve ter no maximo 5 caracteres." });
      const numero = Number(json.numero);
      if (numero <= 0) return sendJson(422, { error: "O numero do assento deve ser um inteiro positivo." });
      if (assentos.some(a => a.salaId === salaId && a.fileira === fileira && a.numero === numero)) {
        return sendJson(422, { error: "Ja existe um assento com esse numero na fileira dessa sala." });
      }
      const novo = {
        id: ++nextAssentoId,
        salaId,
        fileira,
        numero,
        status: ['DISPONIVEL', 'RESERVADO', 'INDISPONIVEL'].includes(json.status) ? json.status : 'DISPONIVEL'
      };
      assentos.push(novo);
      return sendJson(201, novo);
    }

    // Assentos: PUT /api/assentos/:id
    if (matchAssentoId && req.method === 'PUT') {
      const id = parseInt(matchAssentoId[1], 10);
      const idx = assentos.findIndex(a => a.id === id);
      if (idx === -1) return sendJson(404, { error: "Assento não encontrado" });

      const salaId = json.salaId !== undefined ? Number(json.salaId) : assentos[idx].salaId;
      const fileira = json.fileira !== undefined ? String(json.fileira).trim().toUpperCase() : assentos[idx].fileira;
      const numero = json.numero !== undefined ? Number(json.numero) : assentos[idx].numero;
      if (fileira.length > 5) return sendJson(422, { error: "A fileira deve ter no maximo 5 caracteres." });
      if (numero !== undefined && numero <= 0) return sendJson(422, { error: "O numero do assento deve ser um inteiro positivo." });
      if (assentos.some(a => a.id !== id && a.salaId === salaId && a.fileira === fileira && a.numero === numero)) {
        return sendJson(422, { error: "Ja existe um assento com esse numero na fileira dessa sala." });
      }
      if (json.salaId !== undefined && !salas.some(s => s.id === salaId)) {
        return sendJson(404, { error: `Sala com ID ${salaId} nao encontrada.` });
      }

      assentos[idx].salaId = salaId;
      assentos[idx].fileira = fileira;
      assentos[idx].numero = numero;
      if (json.status !== undefined) assentos[idx].status = json.status;
      return sendJson(200, assentos[idx]);
    }

    // Assentos: DELETE /api/assentos/:id
    if (matchAssentoId && req.method === 'DELETE') {
      const id = parseInt(matchAssentoId[1], 10);
      const idx = assentos.findIndex(a => a.id === id);
      if (idx === -1) return sendJson(404, { error: "Assento não encontrado" });
      if (ingressos.some(i => i.assentoId === id)) {
        return sendJson(422, { error: "Nao e possivel excluir um assento que ja possui ingresso." });
      }
      assentos.splice(idx, 1);
      res.writeHead(204);
      return res.end();
    }

    // Ingressos: POST /api/ingressos/comprar (compra em lote com validacoes)
    if (pathname === '/api/ingressos/comprar' && req.method === 'POST') {
      const sessaoId = Number(json.sessaoId);
      const assentoIds = Array.isArray(json.assentoIds) ? json.assentoIds.map(Number) : [];
      const nomeCliente = (json.nomeCliente || '').trim();

      if (!sessaoId) return sendJson(422, { error: "Informe o id da sessao." });
      if (assentoIds.length === 0) return sendJson(422, { error: "Selecione ao menos um assento." });
      if (!nomeCliente) return sendJson(422, { error: "Informe o nome do cliente." });
      if (new Set(assentoIds).size !== assentoIds.length) {
        return sendJson(422, { error: "Ha assentos repetidos na compra." });
      }

      const sessao = sessoes.find(s => s.id === sessaoId);
      if (!sessao) return sendJson(404, { error: `Sessao com ID ${sessaoId} nao encontrada.` });
      if (sessao.status === sessoesEstado.CANCELADA || sessao.status === sessoesEstado.ENCERRADA) {
        return sendJson(422, { error: `Nao e possivel comprar ingressos para uma sessao ${sessao.status.toLowerCase()}.` });
      }
      const sala = salas.find(sl => sl.id === sessao.salaId);

      const selecionados = assentoIds.map(id => assentos.find(a => a.id === id));
      if (selecionados.some(a => !a)) return sendJson(422, { error: "Um ou mais assentos informados nao existem." });
      const foraDaSala = selecionados.find(a => a.salaId !== sessao.salaId);
      if (foraDaSala) {
        return sendJson(422, { error: `O assento ${foraDaSala.fileira}${foraDaSala.numero} nao pertence a sala da sessao.` });
      }
      const indisponivel = selecionados.find(a => a.status === 'INDISPONIVEL');
      if (indisponivel) {
        return sendJson(422, { error: `O assento ${indisponivel.fileira}${indisponivel.numero} esta INDISPONIVEL.` });
      }

      const jaVendidos = ingressosDaSessao(sessaoId).filter(i => i.assentoId !== undefined);
      const vendidoMap = {};
      jaVendidos.forEach(i => { vendidoMap[i.assentoId] = i; });
      const conflito = assentoIds.find(id => vendidoMap[id]);
      if (conflito) {
        const a = vendidoMap[conflito];
        return sendJson(422, { error: `O assento ${a.fileira}${a.numero} ja foi vendido/reservado para esta sessao.` });
      }

      const vendidos = ingressosVendidosDe(sessaoId);
      if (vendidos + assentoIds.length > sala.capacidadeTotal) {
        return sendJson(422, { error: `Sessao sem capacidade para ${assentoIds.length} ingressos (ocupacao ${vendidos}/${sala.capacidadeTotal}).` });
      }

      const valor = json.valor !== undefined ? Number(json.valor) : VALOR_INGRESSO;
      if (!(valor > 0)) return sendJson(422, { error: "O valor do ingresso deve ser maior que zero." });

      const agora = new Date().toISOString();
      const criados = assentoIds.map(id => {
        const a = assentos.find(x => x.id === id);
        return {
          id: ++nextIngressoId,
          sessaoId,
          assentoId: id,
          fileira: a.fileira,
          numero: a.numero,
          nomeCliente,
          valor,
          status: statusIngresso.VENDIDO,
          dataCompra: agora,
          dataCadastro: agora,
          dataAtualizacao: agora
        };
      });
      ingressos.push(...criados);
      if (ingressosVendidosDe(sessaoId) >= sala.capacidadeTotal && sessao.status !== sessoesEstado.CANCELADA) {
        sessao.status = sessoesEstado.LOTADA;
      }
      return sendJson(201, criados);
    }

    // Ingressos: POST /api/ingressos (cadastro avulso)
    if (pathname === '/api/ingressos' && req.method === 'POST') {
      const sessaoId = Number(json.sessaoId);
      const assentoId = Number(json.assentoId);
      const sessao = sessoes.find(s => s.id === sessaoId);
      if (!sessao) return sendJson(404, { error: `Sessao com ID ${sessaoId} nao encontrada.` });
      const assento = assentos.find(a => a.id === assentoId);
      if (!assento) return sendJson(404, { error: `Assento com ID ${assentoId} nao encontrado.` });
      if (sessao.salaId !== assento.salaId) {
        return sendJson(422, { error: `O assento ${assento.fileira}${assento.numero} nao pertence a sala da sessao.` });
      }
      if (ingressos.some(i => i.sessaoId === sessaoId && i.assentoId === assentoId)) {
        return sendJson(422, { error: `O assento ${assento.fileira}${assento.numero} ja foi vendido/reservado para esta sessao.` });
      }
      if (!(json.nomeCliente || '').trim()) return sendJson(422, { error: "Informe o nome do cliente." });

      const agora = new Date().toISOString();
      const statusFinal = ['DISPONIVEL', 'RESERVADO', 'VENDIDO', 'UTILIZADO'].includes(json.status) ? json.status : statusIngresso.VENDIDO;
      const novo = {
        id: ++nextIngressoId,
        sessaoId,
        assentoId,
        fileira: assento.fileira,
        numero: assento.numero,
        nomeCliente: json.nomeCliente.trim(),
        valor: json.valor !== undefined ? Number(json.valor) : VALOR_INGRESSO,
        status: statusFinal,
        dataCompra: statusFinal === statusIngresso.VENDIDO ? agora : null,
        dataCadastro: agora,
        dataAtualizacao: agora
      };
      ingressos.push(novo);
      return sendJson(201, novo);
    }

    // Ingressos: PUT /api/ingressos/:id
    if (matchIngressoId && req.method === 'PUT') {
      const id = parseInt(matchIngressoId[1], 10);
      const idx = ingressos.findIndex(i => i.id === id);
      if (idx === -1) return sendJson(404, { error: "Ingresso não encontrado" });

      if (json.status !== undefined) ingressos[idx].status = json.status;
      if (json.nomeCliente !== undefined) ingressos[idx].nomeCliente = String(json.nomeCliente).trim();
      if (json.valor !== undefined) ingressos[idx].valor = Number(json.valor);
      ingressos[idx].dataAtualizacao = new Date().toISOString();
      return sendJson(200, ingressos[idx]);
    }

    // Ingressos: DELETE /api/ingressos/:id
    if (matchIngressoId && req.method === 'DELETE') {
      const id = parseInt(matchIngressoId[1], 10);
      const idx = ingressos.findIndex(i => i.id === id);
      if (idx === -1) return sendJson(404, { error: "Ingresso não encontrado" });
      ingressos.splice(idx, 1);
      res.writeHead(204);
      return res.end();
    }

    // Auth: POST /api/auth/login
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const email = String(json.email || '').trim().toLowerCase();
      const senha = String(json.senha || '');
      const u = usuarios.find(x => x.email.toLowerCase() === email);
      if (!u || u.senha !== senha || !u.ativo) {
        return sendJson(401, { status: 401, error: "Credenciais Invalidas", message: "Email ou senha invalidos." });
      }
      return sendJson(200, { token: gerarTokenMock(u), expiresIn: 86400000, usuario: toUsuarioPublico(u) });
    }

    // Auth: POST /api/auth/refresh (novo token a partir do atual)
    if (pathname === '/api/auth/refresh' && req.method === 'POST') {
      const u = usuarioPorToken(req);
      if (!u) return sendJson(401, { status: 401, error: "Nao Autorizado", message: "Token invalido." });
      return sendJson(200, { token: gerarTokenMock(u), expiresIn: 86400000, usuario: toUsuarioPublico(u) });
    }

    // Usuarios: POST /api/usuarios
    if (pathname === '/api/usuarios' && req.method === 'POST') {
      const nome = (json.nome || '').trim();
      const email = (json.email || '').trim();
      const senha = String(json.senha || '');
      if (!nome || !email || !senha) {
        return sendJson(400, { error: "Campos obrigatorios ausentes: nome, email, senha" });
      }
      if (usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return sendJson(422, { error: `Ja existe um usuario com o email ${email}.` });
      }
      const agora = new Date().toISOString();
      const novo = {
        id: nextUsuarioId++,
        nome,
        email,
        senha,
        perfil: PERFIS_VALIDOS.includes(json.perfil) ? json.perfil : 'ATENDENTE',
        ativo: json.ativo !== undefined ? Boolean(json.ativo) : true,
        dataCadastro: agora,
        dataAtualizacao: agora
      };
      usuarios.push(novo);
      return sendJson(201, toUsuarioPublico(novo));
    }

    // Usuarios: PUT /api/usuarios/:id
    if (matchUsuarioId && req.method === 'PUT') {
      const id = parseInt(matchUsuarioId[1], 10);
      const idx = usuarios.findIndex(u => u.id === id);
      if (idx === -1) return sendJson(404, { error: "Usuário não encontrado" });

      const email = (json.email !== undefined ? String(json.email).trim() : usuarios[idx].email);
      if (usuarios.some(u => u.id !== id && u.email.toLowerCase() === email.toLowerCase())) {
        return sendJson(422, { error: `Ja existe um usuario com o email ${email}.` });
      }

      if (json.nome !== undefined) usuarios[idx].nome = String(json.nome).trim();
      usuarios[idx].email = email;
      const novaSenha = String(json.senha || '');
      if (novaSenha) usuarios[idx].senha = novaSenha;
      if (json.perfil !== undefined && PERFIS_VALIDOS.includes(json.perfil)) {
        usuarios[idx].perfil = json.perfil;
      }
      if (json.ativo !== undefined) usuarios[idx].ativo = Boolean(json.ativo);
      usuarios[idx].dataAtualizacao = new Date().toISOString();
      return sendJson(200, toUsuarioPublico(usuarios[idx]));
    }

    // Usuarios: DELETE /api/usuarios/:id
    if (matchUsuarioId && req.method === 'DELETE') {
      const id = parseInt(matchUsuarioId[1], 10);
      const idx = usuarios.findIndex(u => u.id === id);
      if (idx === -1) return sendJson(404, { error: "Usuário não encontrado" });
      usuarios.splice(idx, 1);
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