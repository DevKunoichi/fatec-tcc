// Servidor API REST Standalone (Node.js) - Executa imediatamente sem dependencias externas
// Replica fielmente os endpoints do Spring Boot (/api/produtos)
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 8080;

let produtos = [
  { id: 1, nome: "Pipoca Grande Salgada", categoria: "Pipocas", unidade: "Balde 200g", preco: 24.00, quantidadeEstoque: 45, estoqueMinimo: 10, statusEstoque: "NORMAL", dataCadastro: new Date().toISOString() },
  { id: 2, nome: "Pipoca Média Manteiga", categoria: "Pipocas", unidade: "Saco 120g", preco: 18.50, quantidadeEstoque: 8, estoqueMinimo: 10, statusEstoque: "BAIXO", dataCadastro: new Date().toISOString() },
  { id: 3, nome: "Coca-Cola Lata 350ml", categoria: "Bebidas", unidade: "Lata", preco: 9.00, quantidadeEstoque: 80, estoqueMinimo: 20, statusEstoque: "NORMAL", dataCadastro: new Date().toISOString() },
  { id: 4, nome: "Água Mineral s/ Gás 500ml", categoria: "Bebidas", unidade: "Garrafa", preco: 6.00, quantidadeEstoque: 50, estoqueMinimo: 15, statusEstoque: "NORMAL", dataCadastro: new Date().toISOString() },
  { id: 5, nome: "Chocolate Confete 80g", categoria: "Doces", unidade: "Pacote", preco: 12.00, quantidadeEstoque: 35, estoqueMinimo: 8, statusEstoque: "NORMAL", dataCadastro: new Date().toISOString() },
  { id: 6, nome: "Nachos com Queijo Cheddar", categoria: "Combos", unidade: "Porção", preco: 28.00, quantidadeEstoque: 0, estoqueMinimo: 5, statusEstoque: "ESGOTADO", dataCadastro: new Date().toISOString() },
  { id: 7, nome: "Combo Clássico (Pipoca G + Refri)", categoria: "Combos", unidade: "Combo", preco: 32.00, quantidadeEstoque: 20, estoqueMinimo: 5, statusEstoque: "NORMAL", dataCadastro: new Date().toISOString() }
];

let nextId = 8;

let sessoes = [
  { id: 1, filme: "O Auto da Compadecida 2", sala: "Sala 1 - VIP", horario: "19:00", capacidade: 100, ingressosVendidos: 45, status: "DISPONÍVEL" },
  { id: 2, filme: "Duna: Parte 2", sala: "Sala 2 - IMAX", horario: "21:30", capacidade: 250, ingressosVendidos: 250, status: "ESGOTADO" },
  { id: 3, filme: "Deadpool & Wolverine", sala: "Sala 3", horario: "16:00", capacidade: 150, ingressosVendidos: 10, status: "DISPONÍVEL" }
];
let nextSessaoId = 4;

function updateStatus(p) {
  if (p.quantidadeEstoque <= 0) p.statusEstoque = "ESGOTADO";
  else if (p.quantidadeEstoque <= p.estoqueMinimo) p.statusEstoque = "BAIXO";
  else p.statusEstoque = "NORMAL";
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
    return sendJson(200, sessoes);
  }

  // Sessoes: GET /api/sessoes/:id
  const matchSessaoId = pathname.match(/^\/api\/sessoes\/(\d+)$/);
  if (matchSessaoId && req.method === 'GET') {
    const id = parseInt(matchSessaoId[1], 10);
    const item = sessoes.find(s => s.id === id);
    if (!item) return sendJson(404, { error: "Sessão não encontrada", id });
    return sendJson(200, item);
  }

  // Helper to read body
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let json = {};
    if (body) {
      try { json = JSON.parse(body); } catch(e) {}
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
      const nova = {
        id: nextSessaoId++,
        filme: json.filme,
        sala: json.sala,
        horario: json.horario,
        capacidade: Number(json.capacidade),
        ingressosVendidos: Number(json.ingressosVendidos || 0),
        status: json.status || "DISPONÍVEL"
      };
      sessoes.push(nova);
      return sendJson(201, nova);
    }

    // Sessoes: PUT /api/sessoes/:id
    if (matchSessaoId && req.method === 'PUT') {
      const id = parseInt(matchSessaoId[1], 10);
      const idx = sessoes.findIndex(s => s.id === id);
      if (idx === -1) return sendJson(404, { error: "Sessão não encontrada" });
      
      sessoes[idx] = { ...sessoes[idx], ...json, id };
      return sendJson(200, sessoes[idx]);
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

    // 404 fallback
    sendJson(404, { error: "Rota não encontrada", path: pathname });
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎬 API REST - Sistema de Cinema (CRUD Produtos & Estoque)`);
  console.log(`📡 Endpoints disponíveis em http://localhost:${PORT}/api/produtos`);
  console.log(`✨ Pronto para receber requisições do frontend e Postman/Insomnia`);
  console.log(`====================================================`);
});
