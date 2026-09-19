# Plano Completo: Integração OMDb API + Pendências do Projeto Fatec-TCC

**Projeto:** Sistema de Gerenciamento Integrado para Cinemas (Cine Novelino)
**Data original:** 2026-09-17
**Última atualização:** 2026-09-19
**Status:** Em andamento — Fase 1 ✅ e Fase 2 ✅ concluídas e commitadas; aguardando teste do usuário + chave OMDb; próximo passo: Fase 3

---

## 0. Registro de Progresso (Changelog)

### ✅ Concluído — 2026-09-19

1. **Correção: renderização do frontend (Tailwind v4)**
   - Branch: `fix/tailwind-v4-build` · Commit: `facf69a`
   - Causa raiz: o plugin `@tailwindcss/vite` não estava configurado; o `@import "tailwindcss"` injetava só o CSS base e as classes utilitárias não eram geradas (corpo das páginas sem estilo).
   - Solução: instalado `@tailwindcss/vite`, adicionado ao `vite.config.js`, removidos `autoprefixer` e `postcss` (sobras do Tailwind v3).
   - `npm run build` produz CSS com ~16-17 kB (utilitárias presentes).

2. **Fase 1 — Entidades de catálogo: Sala + Filme com integração OMDb**
   - Branch: `feat/fase1-sala-filme-omdb` · Commit: `7c2c2a1`
   - Backend Java: `Sala`, `Filme`, `OmdbService`, `OmdbConfig`, DTOs, repositórios, controllers e seeds (3 salas, 3 filmes).
   - Mock Node.js: `/api/filmes`, `/api/salas`, `/api/filmes/buscar` (simulação OMDb).
   - Frontend: `BuscaFilmeModal.jsx` + `SessoesPage` com dropdowns de filmes/salas.
   - Compilado (`mvn compile`) e endpoints testados em runtime (incluindo erro 422 sem chave OMDb e validação de sala duplicada).

3. **Identidade de commits (decisão de processo)**
   - Todos os commits serão feitos em nome de **DevKunoichi** via email noreply `95485578+DevKunoichi@users.noreply.github.com` (forma segura de vincular à conta sem expor email pessoal — o email público da conta é `null`).
   - Config local do repositório: `git config user.name DevKunoichi` + `git config user.email 95485578+DevKunoichi@users.noreply.github.com`.

4. **Auditoria de qualidade (agentes de exploração)** — clean code, boas práticas, versões e segurança.
   - Resultado completo em resumo da sessão; achados críticos e médios mapeados nas seções abaixo.

5. **Correções pós-auditoria (lote "Agora")** — Branch `feat/fase1-sala-filme-omdb`:
   - **Commit `e27e894` — seguranca e limpeza:**
     - 🛡 Vazamento da `OMDB_API_KEY` corrigido: `OmdbService` não propaga mais a mensagem do `RestClientException` (continha a URL com `?apikey=...`). Agora log sanitizado no servidor + mensagem genérica no 422. **Validado:** resposta 422 = `"Nao foi possivel consultar a API OMDb no momento..."` sem chave/URL.
     - 🛡 CORS centralizado no `CorsConfig` (origens por propriedade `app.cors.allowed-origins`, default `http://localhost:5173,http://127.0.0.1:5173`); removido `@CrossOrigin("*")` de Produto/Sala/FilmeController. **Validado:** `evil.com` → 403.
     - 🛡 H2 console não aceita conexões remotas (`web-allow-others=false`).
     - 🛡 Mock Node: bind apenas `127.0.0.1`; `POST /api/filmes/buscar` retorna 200 (novo e repetido), alinhado ao Java. **Validado** na porta 9099.
     - 🧹 Removidos artefatos rastreados sem uso: `Layout.jsx` corrompido (null bytes), `support.js` e `.thumbnail` (raiz e docs), `package-lock.json` stub da raiz, PDF duplicado em `frontend/uploads/`.
     - 🧹 `.gitignore` ampliado (`.env*`, `.env.*`, `*.local`, `node_modules`, `dist`, `support.js`, `*.thumbnail`, `frontend/uploads/`).
- **Commit `033c22e` — upgrade Spring Boot 3.3.4 → 3.5.16:**
      - Linha 3.3.x fora de suporte desde 06/2025 (sem correção de CVE nas transitivas Tomcat/Jackson/Hibernate). 3.5.16 é o último patch da linha estável 3.x, mantendo Java 17. **Validado:** `mvn compile` + boot + endpoints OK.

7. **Fase 2 — Sessão Normalizada (migrar do modelo flat, com FKs reais)**
   - Branch: `feat/fase2-sessao-normalizada` · Commit: `ebb90ec`
   - Backend Java: `Sessao`, `StatusSessao` (DISPONIVEL/LOTADA/CANCELADA/ENCERRADA), `SessaoRequestDTO`/`SessaoResponseDTO`, `SessaoRepository` (incl. `findConflitantes` excluindo CANCELADA e a própria sessão no PUT), `SessaoService` (CRUD + validações de horário/conflito) e `SessaoController` (`/api/sessoes` GET/POST/PUT/DELETE). Seeds de 3 sessões.
   - Mock Node.js reescrito no modelo normalizado (filmeId/salaId) com `enriquecerSessao` no shape do Java, POST 201 e validações equivalentes.
   - Frontend `SessoesPage.jsx` refatorado: selects por id, `datetime-local`, status badge/select, ocupação (vendidos/capacidade) e vagas disponíveis.
   - Correções durante a implementação: ordem dos seeds garantida com `@Order` (sessões dependem de filmes/salas); validação resolve filme/sala antes do conflito (filme inexistente → 404); mock `toLocal` corrigido para wall-clock local (evita giro de +3h por `toISOString()` UTC, que quebrava a detecção de conflito) e 404 para filme/sala inexistente.
   - **Validado em runtime:** CRUD completo (201/200/204), conflito de horário → 422, fim ≤ início → 422, filme/sala inexistente → 404, slot de sessão CANCELADA reutilizável, `npm run build` OK.

**Próximos achados da auditoria a resolver (fora do lote "Agora", a combinar):**

- **[Alta] API sem autenticação** — mutadores expostos (CORS já restrito); resolver na Fase 4 (Spring Security + JWT).
- **[Média] `ddl-auto=update` + perfis dev/prod** — config PostgreSQL comentada no properties principal; separar profiles e migrações na Fase 6.
- **[Média] H2 em memória** perde dados ao reiniciar; `show-sql=true` no properties principal (mover p/ dev).
- **[Média] Tratamento de exceções incompleto** — sem fallback `Exception` e sem handler para `DataIntegrityViolationException`/`HttpMessageNotReadableException` (500 genérico em duplicidade de `imdb_id`/`nome_numero`); sem logging das exceções.
- **[Média] Frontend** — `baseURL` fixo `http://localhost:8080/api` (embutido no bundle; trocar por `VITE_API_URL`); erros de fetch só `console.error` (mostra "Nenhum..." enganoso); labels sem `htmlFor`/a11y em modais; `lucide-react` instalado e não usado; ESLint sem config; `temp-react` no nome/título.
- **[Média] Mock** — divergências menores de contrato (PUT filmes/salas ausentes, sala duplicada aceita, JSON inválido engolido, body sem limite de tamanho).
- **[Média] `docs/crud.md`** — referências quebradas (linhas 28-31 e 94).

### ⏳ Pendências

| # | Item | Detalhe |
|---|------|---------|
| 1 | **Chave OMDb** | Aguardando a DevKunoichi fornecer a chave (licença do usuário usada para criar). |
| 2 | **Teste do usuário** | Rodar `npm run dev` + `node backend/server.js` (mock) ou o backend Java para validar Fases 1 e 2. |
| 3 | **Push para o remoto** | a chave SSH local é `Leporoni`, **sem permissão de escrita** no repo `DevKunoichi/fatec-tcc` (push negado). Comits estão locais. Resolver: adicionar Leporoni como colaborador OU fazer fork + PR. |
| 4 | **Decisão: onde guardar a chave OMDb** | Opção A (recomendada): dependência `spring-dotenv` + arquivo `backend/.env` (gitignored). Opção B: variável de ambiente do SO. Ver seção 7. |
| 5 | **Banco persistente** | Por enquanto H2 em memória (dados somem ao reiniciar). PostgreSQL planejado (Fase 6). |

### 📌 Fluxo de trabalho por fases

```
Fase concluída → commit como DevKunoichi → criar branch da próxima fase → implementar
```
- Correção Tailwind: branch `fix/tailwind-v4-build` (push pendente).
- Fase 1: branch `feat/fase1-sala-filme-omdb`.
- Fase 2: branch `feat/fase2-sessao-normalizada` (concluída, aguardando push).
- Próxima: `feat/fase3-assentos-ingressos`.

---

## 1. Análise da OMDb API

### 1.1 O que é

A [OMDb API](https://www.omdbapi.com/) é uma API REST gratuita que retorna dados de filmes em JSON. Conteúdo mantido por contribuidores.

**Base URL:** `https://www.omdbapi.com/`

**Requer API Key:** Gratuita, obtida via email em [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx). Limite: 1.000 requests/dia (plano gratuito).

### 1.2 Endpoints Disponíveis

| Método | Uso | Parâmetros principais |
|--------|-----|----------------------|
| Busca por título | `GET /?t={titulo}&apikey={key}` | `t` (título), `y` (ano), `type` (movie/series), `plot` (short/full) |
| Busca por ID IMDb | `GET /?i={imdbId}&apikey={key}` | `i` (ex: tt1285016), `plot` (short/full) |
| Busca por termo | `GET /?s={termo}&apikey={key}` | `s` (termo), `page` (1-100), `type`, `y` |

### 1.3 Campos da Response (detalhes por título/ID)

| Campo | Tipo | Uso no Cinema Novelino |
|-------|------|----------------------|
| `Title` | String | `titulo` do Filme |
| `Year` | String | Contexto de lançamento |
| `Rated` | String | `classificacaoEtaria` (PG-13, R, 18, etc.) |
| `Released` | String | Data de lançamento |
| `Runtime` | String | `duracaoMinutos` (ex: "120 min") |
| `Genre` | String | Gênero (Ação, Comédia, Drama) |
| `Director` | String | Diretor (dado extra) |
| `Actors` | String | Atores (dado extra) |
| `Plot` | String | `sinopse` |
| `Language` | String | Idioma |
| `Country` | String | País de origem |
| `Poster` | String (URL) | URL do cartaz para UI |
| `imdbRating` | String | Nota IMDb (dado extra) |
| `imdbID` | String | ID único para cache/deduplicação |
| `Type` | String | movie, series, episode |

### 1.4 Exemplo de Response

```json
{
  "Title": "Duna: Parte Dois",
  "Year": "2024",
  "Rated": "PG-13",
  "Released": "01 Mar 2024",
  "Runtime": "166 min",
  "Genre": "Action, Adventure, Drama",
  "Director": "Denis Villeneuve",
  "Actors": "Timothée Chalamet, Zendaya, Austin Butler",
  "Plot": "Paul Atreides se une com os Fremen...",
  "Language": "English",
  "Country": "United States",
  "Poster": "https://m.media-amazon.com/images/M/...",
  "imdbRating": "8.5",
  "imdbID": "tt15239678",
  "Type": "movie"
}
```

### 1.5 Limitações

- Limite de 1.000 requests/dia (plano gratuito)
- Sem suporte a busca por gênero ou popularidade
- Dados podem estar incompletos para filmes brasileiros/indies
- `Poster` API só disponível para patrocinadores
- Conteúdo em inglês predominante (títulos PT-BR podem não ser encontrados)

### 1.6 Estratégia de Integração

```
Frontend (busca) → Backend (OmdbService) → OMDb API
                         ↓
                    Converte response
                         ↓
                    Salva no banco (Filme entity)
                         ↓
                    Retorna FilmeResponseDTO
```

**Fluxo do usuário:**
1. Gerente acessa Sessões → clica "Buscar Filme"
2. Digita nome do filme → frontend chama `POST /api/filmes/buscar?titulo=Duna`
3. Backend busca na OMDb → converte → salva no banco
4. Retorna filme ao frontend → gerente seleciona
5. Gerente escolhe sala e horário → cria Sessão

---

## 2. Gap Analysis Completo do Projeto

### 2.1 Entidades: Implementadas vs Planejadas

| # | Entity | Java (Spring Boot) | Node.js (mock) | Frontend | DER Planejado |
|---|--------|:------------------:|:--------------:|----------|:-------------:|
| 1 | **Produto** | ✅ Completo | ✅ Completo | ✅ ProdutosPage | ✅ |
| 2 | **Filme** | ✅ Completo (Fase 1) | ✅ (Fase 1) | ✅ Dropdown + Busca OMDb | ✅ titulo, classificacao_etaria, duracao_minutos, sinopse, genero, poster_url, imdb_id |
| 3 | **Sala** | ✅ Completo (Fase 1) | ✅ (Fase 1) | ✅ Dropdown SessoesPage | ✅ nome_numero, capacidade_total |
| 4 | **Sessao** | ✅ Completo (Fase 2) | ✅ (Fase 2) | ✅ CRUD completo | ✅ filme_id FK, sala_id FK, data_hora_inicio, data_hora_fim |
| 5 | **Assento** | ❌ | ❌ | ❌ | ✅ sala_id FK, fileira, numero |
| 6 | **Ingresso** | ❌ | ❌ | ❌ | ✅ sessao_id FK, assento_id FK, usuario_id FK, valor, status |
| 7 | **Usuario** | ❌ | ❌ | ❌ Placeholder | ✅ nome, email, senha_hash, perfil |
| 8 | **MovimentacaoEstoque** | ❌ (só DTO) | ❌ (só DTO) | ❌ | ✅ produto_id FK, tipo, quantidade, data |
| 9 | **PedidoVenda** | ❌ | ❌ | ❌ | ✅ usuario_id FK, valor_total, forma_pagamento, data_venda |

**Status: 4 de 9 entidades implementadas na API Java (44%)**

### 2.2 Frontend: Status das Pages

| Page | Rota | Funciona com Java? | Funciona com Node.js? | Observação |
|------|------|:------------------:|:---------------------:|------------|
| ProdutosPage | `/produtos` | ✅ Sim | ✅ Sim | CRUD completo, totalmente funcional |
| SessoesPage | `/` | ✅ Sim | ✅ Sim | CRUD completo de sessões (filmels/salas por id, horários, status, ocupação) + Busca OMDb |
| UsuariosPage | `/usuarios` | ❌ N/A | ❌ N/A | Placeholder estático ("Em Desenvolvimento") |

### 2.3 Endpoints Planejados vs Implementados

| Endpoint | Planejado em | Implementado? |
|----------|-------------|:-------------:|
| `GET /api/produtos` | crud.md 4.4 | ✅ Java + Node.js |
| `POST /api/produtos` | crud.md 4.4 | ✅ Java + Node.js |
| `PUT /api/produtos/{id}` | crud.md 4.4 | ✅ Java + Node.js |
| `DELETE /api/produtos/{id}` | crud.md 4.4 | ✅ Java + Node.js |
| `PATCH /api/produtos/{id}/estoque` | crud.md 4.4 | ✅ Java + Node.js |
| `GET /api/sessoes` | crud.md 4.2 | ✅ Java + Node.js |
| `POST /api/sessoes` | crud.md 4.2 | ✅ Java + Node.js |
| `PUT /api/sessoes/{id}` | crud.md 4.2 | ✅ Java + Node.js |
| `DELETE /api/sessoes/{id}` | crud.md 4.2 | ✅ Java + Node.js |
| `POST /api/filmes/buscar?titulo=` | **NOVO (OMDb)** | ✅ Java (real) + Node.js (simulado) |
| `GET /api/filmes` | crud.md 4.2 | ✅ Java + Node.js |
| `POST /api/filmes` | crud.md 4.2 | ✅ Java + Node.js |
| `PUT /api/filmes/{id}` | crud.md 4.2 | ✅ Java + Node.js |
| `DELETE /api/filmes/{id}` | crud.md 4.2 | ✅ Java + Node.js |
| `GET /api/salas` | crud.md 4.2 | ✅ Java + Node.js |
| `POST /api/salas` | crud.md 4.2 | ✅ Java + Node.js |
| `PUT /api/salas/{id}` | crud.md 4.2 | ✅ Java + Node.js |
| `DELETE /api/salas/{id}` | crud.md 4.2 | ✅ Java + Node.js |
| `GET /api/sessoes/{id}/assentos` | crud.md 4.3 | ❌ |
| `POST /api/ingressos/comprar` | crud.md 4.3 | ❌ |
| `POST /api/auth/login` | crud.md 4.1 | ❌ |
| `POST /api/usuarios` | crud.md 4.1 | ❌ |

### 2.4 Lacunas Arquiteturais

| Item | Planejado em | Status |
|------|-------------|--------|
| Spring Security + JWT | crud.md linha 9 | ❌ Nenhum código |
| Flyway/Liquibase (migrations) | crud.md linha 10 | ❌ Usa `ddl-auto=update` |
| PostgreSQL (produção) | application.properties | ❌ Configurado mas comentado |
| H2 (desenvolvimento) | application.properties | ✅ Funcional |
| CORS config | CorsConfig.java | ✅ Restrito (origens configuráveis; dev: localhost:5173) |

### 2.5 Itens com problemas menores

| Item | Arquivo | Problema |
|------|---------|----------|
| Nome do projeto | `frontend/package.json`, `index.html` | Ainda diz "temp-react" — renomear na Fase 6 |
| Navigation counts | `Navigation.jsx` linha 6 | `count: 8` hardcoded para todos — dinâmico na Fase 6 |
| Referência quebrada | `docs/crud.md` linha 94 | Refere `frontend/crud_produtos.html` (não existe) — corrigir na Fase 6 |

> **Observação:** a falha de renderização do frontend (corpo das páginas sem CSS do Tailwind) já foi **resolvida** em `facf69a` — ver seção 0.2.

---

## 3. Plano de Implementação por Fases

### Fase 1 — Entidades de Catálogo: Sala + Filme com OMDb

**Objetivo:** Criar a base de dados para filmes e salas, integrando com a OMDb API.

**Status: ✅ CONCLUÍDA** (commit `7c2c2a1` na branch `feat/fase1-sala-filme-omdb`) — salvo a chegada da chave OMDb para teste real da busca.

**Pré-requisitos:**
- [x] Registrar API key em omdbapi.com/apikey.aspx
- [ ] Adicionar API key — pendente: escolher entre `.env` (spring-dotenv, recomendado) ou variável de ambiente
- [x] `application.properties` lê a chave via `${OMDB_API_KEY:}` **(nunca guardar a chave no commit)**

**Backend (Java/Spring Boot):**

**Entidade Sala:**
- [x] `Sala.java` — Entity JPA: `id` (Long, auto), `nomeNumero` (String, max 50, unique), `capacidadeTotal` (Integer)
- [x] `SalaRequestDTO.java` — validação: nomeNumero obrigatório, capacidadeTotal > 0
- [x] `SalaResponseDTO.java` — retorna entidade + dataCadastro
- [x] `SalaRepository.java` — `findByNomeNumeroIgnoreCase`
- [x] `SalaService.java` — CRUD com validação de nome duplicado
- [x] `SalaController.java` — GET/POST/PUT/DELETE `/api/salas`
- [x] Seed: 3 salas (Sala 1 - Padrão/150, Sala 2 - IMAX/250, Sala 3 - VIP/50)

**Entidade Filme:**
- [x] `Filme.java` — Entity JPA: `id`, `titulo`, `classificacaoEtaria`, `duracaoMinutos`, `sinopse`, `genero`, `posterUrl`, `imdbId` (unique, nullable), `dataCadastro`, `dataAtualizacao`
- [x] `FilmeRequestDTO.java` — titulo obrigatório
- [x] `FilmeResponseDTO.java` — todos os campos + timestamps
- [x] `FilmeRepository.java` — `findByTituloIgnoreCase`, `findByImdbId`
- [x] `FilmeService.java` — CRUD + busca OMDb com deduplicação por imdbId
- [x] `OmdbService.java` — integração com `?t={titulo}&apikey={key}`, conversão, tratamento de "N/A" e erros (film not found, timeout, rate limit)
- [x] `OmdbConfig.java` — `RestTemplate` com timeouts (connect 5s, read 10s)
- [x] `FilmeController.java`:
  - [x] `GET /api/filmes` — lista catálogo local
  - [x] `GET /api/filmes/{id}` — detalhes do filme
  - [x] `POST /api/filmes` — cadastra manualmente
  - [x] `POST /api/filmes/buscar?titulo=X` — busca OMDb + cadastra + retorna
  - [x] `DELETE /api/filmes/{id}` — remove

**Frontend:**
- [x] Componente `BuscaFilmeModal.jsx` — input de busca + resultado da OMDb + botão "Usar este filme"
- [x] Integração no `SessoesPage.jsx` — dropdown de filmes (catálogo local) + dropdown de salas (capacidade autopreenchida)

**Testes:**
- [x] Compilação (`mvn compile`) e smoke tests dos endpoints em runtime (GET/POST/DELETE salas e filmes; erro 422 sem chave OMDb; sala duplicada)
- [x] `npm run build` do frontend (86 módulos)
- [ ] Unit tests automatizados (OmdbServiceTest, FilmeServiceTest, SalaServiceTest) — programados para a Fase 6

---

### Fase 2 — Sessão Normalizada (migrar do modelo flat)

**Objetivo:** Refatorar Sessão para usar FKs (Filme, Sala) conforme DER planejado.

**Backend:**
- [x] `Sessao.java` — Entity JPA: `id`, `filme` (ManyToOne → Filme), `sala` (ManyToOne → Sala), `dataHoraInicio` (LocalDateTime), `dataHoraFim` (LocalDateTime), `status` (enum: DISPONIVEL, LOTADA, CANCELADA, ENCERRADA), `dataCadastro`, `dataAtualizacao`
- [x] `SessaoRequestDTO.java` — `filmeId` (Long), `salaId` (Long), `dataHoraInicio` (LocalDateTime), `dataHoraFim` (LocalDateTime), `status` (opcional)
- [x] `SessaoResponseDTO.java` — inclui `FilmeResponseDTO`, `SalaResponseDTO`, `ingressosVendidos` (0 por enquanto), `vagasDisponiveis`
- [x] `SessaoRepository.java` — `findBySalaIdAndDataHoraInicioBetween`, `findByFilmeId`, `findConflitantes`
- [x] `SessaoService.java` — CRUD + validações:
  - [x] Não pode criar sessão com conflito de horário na mesma sala (sessões CANCELADAS ignoradas)
  - [x] `dataHoraFim` deve ser posterior a `dataHoraInicio`
  - [ ] Status automático: LOTADA quando ingressos = capacidade da sala — depende da Fase 3 (Ingressos); hoje `ingressosVendidos` será 0
- [x] `SessaoController.java` — GET/POST/PUT/DELETE `/api/sessoes`

**Frontend:**
- [x] Refatorar `SessoesPage.jsx`:
  - [x] Dropdown do catálogo local + botão "Buscar Filme (OMDb)"
  - [x] Dropdown de salas
  - [x] Campos `datetime-local` (início/fim)
  - [x] Remover campos `capacidade` e `ingressosVendidos` (agora vêm de Sala)
  - [x] Badge de status (DISPONIVEL / LOTADA / CANCELADA / ENCERRADA) + select no form
  - [x] Mostrar vagas restantes (capacidade da sala - ingressos vendidos), com barra de ocupação

---

### Fase 3 — Assentos + Ingressos

**Objetivo:** Gerenciar mapa de assentos e venda de ingressos.

**Backend:**
- [ ] `Assento.java` — Entity JPA: `id`, `sala` (ManyToOne → Sala), `fileira` (String, max 5), `numero` (Integer), `status` (enum: DISPONIVEL, RESERVADO, INDISPONIVEL)
- [ ] `Ingresso.java` — Entity JPA: `id`, `sessao` (ManyToOne → Sessao), `assento` (ManyToOne → Assento), `usuario` (ManyToOne → Usuario), `valor` (BigDecimal), `status` (enum: DISPONIVEL, RESERVADO, VENDIDO, UTILIZADO), `dataCompra`
- [ ] CRUD para ambos
- [ ] Endpoint `GET /api/sessoes/{id}/assentos` — mapa de assentos da sessão
- [ ] Endpoint `POST /api/ingressos/comprar` — compra com validação de disponibilidade
- [ ] Seed: gerar assentos automaticamente ao criar Sala (ex: fileiras A-J, 20 assentos cada)
- [ ] Validação: não vender assento já vendido/reservado para a mesma sessão

**Frontend:**
- [ ] Componente `MapaAssentos.jsx` — grid visual de assentos (cores: disponível/reservado/indisponível)
- [ ] Fluxo de compra: selecionar assentos → revisar → confirmar

---

### Fase 4 — Usuários + Segurança (Spring Security + JWT)

**Objetivo:** Autenticação e controle de acesso.

**Backend:**
- [ ] `Usuario.java` — Entity JPA: `id`, `nome`, `email` (unique), `senhaHash`, `perfil` (enum: ADMIN, GERENTE, ATENDENTE, CLIENTE), `ativo`, `dataCadastro`
- [ ] `PerfilUsuario` enum — valores do DER
- [ ] Spring Security:
  - [ ] Dependência `spring-boot-starter-security` no `pom.xml`
  - [ ] `SecurityConfig.java` — configurar URLs públicas vs protegidas
  - [ ] `JwtUtil.java` — gerar/validar tokens JWT
  - [ ] `JwtAuthFilter.java` — filtro de autenticação
  - [ ] `CustomUserDetailsService.java` — carregar usuário por email
- [ ] `AuthController.java`:
  - `POST /api/auth/login` — retorna JWT token
  - `POST /api/auth/refresh` — renovar token
- [ ] `UsuarioController.java` — CRUD (apenas ADMIN pode gerenciar)
- [ ] Senhas com BCrypt
- [ ] Seed: 1 usuário admin (admin@cineNovelino.com / admin123)

**Frontend:**
- [ ] Página `LoginPage.jsx`
- [ ] Interceptador Axios para enviar JWT no header
- [ ] Roteamento protegido (rotas por perfil)
- [ ] Exibir nome do usuário logado no Header

---

### Fase 5 — MovimentacaoEstoque + PedidoVenda

**Objetivo:** Auditoria de estoque e registro de vendas.

**Backend:**
- [ ] `MovimentacaoEstoque.java` — Entity JPA: `id`, `produto` (ManyToOne → Produto), `tipo` (enum: ENTRADA, SAIDA), `quantidade`, `motivo`, `data`, `usuario` (ManyToOne → Usuario)
- [ ] `PedidoVenda.java` — Entity JPA: `id`, `usuario` (ManyToOne → Usuario), `itens` (OneToMany → ItemPedido), `valorTotal`, `formaPagamento`, `dataVenda`, `status`
- [ ] `ItemPedido.java` — Entity JPA: `id`, `pedido` (ManyToOne → PedidoVenda), `produto` (ManyToOne → Produto), `quantidade`, `precoUnitario`
- [ ] Refatorar `PATCH /api/produtos/{id}/estoque` para registrar `MovimentacaoEstoque`
- [ ] Endpoints de relatório:
  - `GET /api/relatorios/vendas?dataInicio=...&dataFim=...`
  - `GET /api/relatorios/estoque/baixo`
  - `GET /api/relatorios/sessoes/ocupacao`

**Frontend:**
- [ ] Página de Relatórios
- [ ] Dashboard com métricas (vendas do dia, estoque baixo, ocupação)

---

### Fase 6 — Infraestrutura e Limpeza

**Objetivo:** Preparar para produção e limpar dívida técnica.

- [ ] **Banco de dados:** Configurar PostgreSQL para profiles de produção/staging
  - Descomentar config PostgreSQL em `application-prod.properties`
  - [ ] Criar `application-prod.properties` com variáveis de ambiente
- [ ] **Migrations:** Adicionar Flyway ou Liquibase
  - [ ] Criar script V1__create_tables.sql
  - [ ] Criar script V2__seed_data.sql
  - [ ] Remover `ddl-auto=update` para produção
- [ ] **Limpeza:**
  - [ ] Deletar `frontend/src/components/layout/Layout.jsx` (corrompido)
  - [ ] Renomear "temp-react" para "cine-novelino" em `package.json` e `index.html`
  - [ ] Atualizar `Navigation.jsx` para counts dinâmicos (via API)
  - [ ] Remover referência quebrada `frontend/crud_produtos.html` do `docs/crud.md`
  - [ ] Remover `support.js` e `.thumbnail` (artifacts de ferramenta AI)
- [ ] **Documentação:**
  - [ ] Atualizar `README.md` com instruções completas de setup
  - [ ] Adicionar Swagger/OpenAPI (SpringDoc) para documentação da API
  - [ ] Atualizar diagramas SVG se schema mudar

---

## 4. Ordem de Execução Recomendada

```
Fase 1 (Sala + Filme + OMDb)
  ↓
Fase 2 (Sessão normalizada)
  ↓
Fase 3 (Assentos + Ingressos)
  ↓
Fase 4 (Usuários + Security)
  ↓
Fase 5 (Estoque audit + Pedidos + Relatórios)
  ↓
Fase 6 (Infraestrutura + Limpeza)
```

Cada fase é independente e entregável. O projeto pode ser demonstrado após qualquer fase.

---

## 5. Schema Planejado (DER)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│    FILME     │     │     SESSAO       │     │    SALA      │
├─────────────┤     ├──────────────────┤     ├─────────────┤
│ id (PK)     │◄──┐ │ id (PK)          │  ┌─►│ id (PK)     │
│ titulo      │   └─│ filme_id (FK)    │  │  │ nome_numero  │
│ classif_et  │     │ sala_id (FK)     │──┘  │ capacidade   │
│ duracao_min │     │ data_hora_inicio │     └──────┬───────┘
│ sinopse     │     │ data_hora_fim    │            │
│ genero      │     │ status           │            │
│ poster_url  │     │ data_cadastro    │     ┌──────▼───────┐
│ imdb_id     │     │ data_atualizacao │     │   ASSENTO    │
│ data_cadast │     └────────┬─────────┘     ├─────────────┤
│ data_atual  │              │               │ id (PK)     │
└─────────────┘              │               │ sala_id(FK) │
                             │               │ fileira     │
                             │               │ numero      │
                             ▼               │ status      │
                    ┌──────────────────┐     └──────┬──────┘
                    │    INGRESSO      │            │
                    ├──────────────────┤            │
                    │ id (PK)          │◄───────────┘
                    │ sessao_id (FK)   │
                    │ assento_id (FK)  │
                    │ usuario_id (FK)──┼──┐
                    │ valor            │  │
                    │ status           │  │
                    │ data_compra      │  │
                    └──────────────────┘  │
                                          │
┌─────────────┐     ┌──────────────────┐  │
│  USUARIO    │     │ PEDIDO_VENDA     │  │
├─────────────┤     ├──────────────────┤  │
│ id (PK)     │◄────│ usuario_id (FK)  │  │
│ nome        │     │ valor_total      │  │
│ email       │     │ forma_pagamento  │  │
│ senha_hash  │     │ data_venda       │  │
│ perfil      │     │ status           │  │
│ ativo       │     └──────────────────┘  │
│ data_cadast │                           │
└──────┬──────┘                           │
       │                                  │
       └──────────────────────────────────┘

┌──────────────────┐
│ MOV_ESTOQUE      │
├──────────────────┤
│ id (PK)          │
│ produto_id (FK)──┼──┐
│ tipo             │  │
│ quantidade       │  │
│ motivo           │  │
│ data             │  │
│ usuario_id (FK)  │  │
└──────────────────┘  │
                      │
┌─────────────────┐   │
│    PRODUTO      │   │
├─────────────────┤   │
│ id (PK)         │◄──┘
│ nome            │
│ categoria       │
│ unidade         │
│ preco           │
│ qtd_estoque     │
│ estoque_min     │
│ data_cadastro   │
│ data_atualizacao│
└─────────────────┘
```

---

## 6. Dependências a Adicionar no pom.xml

```xml
<!-- Carregar .env local (DEVs) — Opção A para OMDB_API_KEY (decisão pendente) -->
<dependency>
    <groupId>me.paulschwarz</groupId>
    <artifactId>spring-dotenv</artifactId>
    <version>4.0.0</version>
</dependency>

<!-- OMDb API integration -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>

<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>

<!-- PostgreSQL (produção) -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Flyway -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>

<!-- Swagger/SpringDoc -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.6.0</version>
</dependency>
```

---

## 7. Variáveis de Ambiente Necessárias

```env
# OMDb API
OMDB_API_KEY=sua_key_aqui

# PostgreSQL (produção)
DATABASE_URL=postgresql://user:pass@localhost:5432/cinema_db

# JWT
JWT_SECRET=chave_secreta_minimo_256_bits
JWT_EXPIRATION=86400000

# Spring Profile
SPRING_PROFILES_ACTIVE=dev
```

**Como alimentar `OMDB_API_KEY` (decisão pendente — seção 0 ⏳ #4):**

- **Opção A (recomendada) — arquivo `.env` local:** adicionar `spring-dotenv` (seção 6) e criar `backend/.env` com `OMDB_API_KEY=...`, incluindo `.env` no `.gitignore`. Funciona ao rodar pela IDE ou `mvn spring-boot:run`, sem setar nada no terminal.
- **Opção B — variável do ambiente do SO:** `export OMDB_API_KEY=...` ou inline no comando `OMDB_API_KEY=... mvn spring-boot:run`. Zero dependência, mas a chave fica no histórico do shell.

O `application.properties` **não muda** nas duas opções — permanece `omdb.api-key=${OMDB_API_KEY:}`.

---

*Plano original criado em 2026-09-17. Atualizado em 2026-09-19 (Fases 1 e 2 concluídas, auditoria de qualidade, correções de segurança/limpeza — sprints `e27e894`/`033c22e`/`ebb90ec`). Próximo passo: teste das Fases 1 e 2 pelo usuário + chave OMDb → Fase 3 (Assentos + Ingressos).*
