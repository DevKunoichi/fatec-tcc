# 🎬 Sistema de Gerenciamento Integrado para Cinemas — Cine Cinemax

Documentação técnica e **controle de status** do projeto (TCC — FATEC).

> Este arquivo é o **controle de status** e a documentação técnica do projeto.
> O detalhamento por fase de implementação fica em
> [`PLANO_INTEGRACAO_OMDB_E_PENDENCIAS.md`](PLANO_INTEGRACAO_OMDB_E_PENDENCIAS.md)
> (na raiz do repositório) — fonte consultada durante as fases de implementação.

---

## 1. Visão Geral

Sistema web para gestão de um cinema: **snack bar (produtos e estoque)**, **catálogo
de filmes** com integração à **OMDb API**, **salas** e **sessões** — com a
arquitetura de backend evoluindo por fases (atualmente Fase 2 concluída).

Frontend em **React + Vite + Tailwind CSS**, backend duplo:

- **Backend definitivo:** Java **Spring Boot 3.5.16** (Java 17), JPA/H2, `REST`.
- **Backend mock (Node.js):** réplica o contrato REST em memória para demo/desenvolvimento
  sem infraestrutura (MySQL/PostgreSQL, chave OMDb etc.). Ficará obsoleto quando
  todas as fases estiverem prontas no Java.

---

## 2. Stack e Versões

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend | React | 19.3 |
| Frontend | Vite | 8.3 |
| Frontend | Tailwind CSS (plugin `@tailwindcss/vite`) | 4.3 |
| Frontend | React Router (react-router-dom) | 7.18 |
| Frontend | Axios | 1.20 |
| Backend | Spring Boot | 3.5.16 (linha 3.x estável; Java 17) |
| Backend | JPA / Hibernate, Bean Validation | via starter `data-jpa` / `validation` |
| Backend | Banco | H2 em memória (dev); driver PostgreSQL já no classpath |
| Backend | Cliente HTTP (OMDb) | `RestTemplate` com timeouts |
| Mock | Node.js (só stdlib, sem dependências) | Node ≥ 18 |

---

## 3. Estrutura do Projeto

```
fatec-tcc/
├── backend/                          # API Java (Spring Boot) + mock Node
│   ├── pom.xml                       # Spring Boot 3.5.16, Java 17
│   ├── server.js                     # Mock Node (réplica do contrato REST)
│   └── src/main/
│       ├── resources/
│       │   └── application.properties# porta, H2, CORS, OMDb, perfis
│       └── java/com/cinema/
│           ├── CinemaApplication.java# entry point + seeds (produtos/salas/filmes/sessoes)
│           ├── config/
│           │   ├── CorsConfig.java   # CORS centralizado (origens por propriedade)
│           │   ├── GlobalExceptionHandler.java # 404 / 422 / 400 em formato JSON
│           │   └── OmdbConfig.java   # RestTemplate com timeouts
│           ├── controllers/          # Produto, Sala, Filme, Sessao
│           ├── dtos/                 # Record DTOs de request/response
│           ├── entities/             # Produto, Sala, Filme, Sessao (JPA)
│           ├── enums/StatusSessao.java
│           ├── exceptions/           # RegraNegocioException, ResourceNotFoundException
│           ├── repositories/         # Spring Data JPA
│           └── services/             # Produto, Sala, Filme, Sessao, Omdb
├── frontend/                         # React + Vite + Tailwind
│   ├── vite.config.js                # plugin react + tailwindcss
│   └── src/
│       ├── App.jsx                   # Rotas (+ layout Header/Navigation)
│       ├── services/api.js           # Axios -> http://localhost:8080/api
│       ├── components/
│       │   ├── layout/Header.jsx, Navigation.jsx
│       │   └── filmes/BuscaFilmeModal.jsx  # busca OMDb + cadastro
│       └── pages/
│           ├── ProdutosPage.jsx      # CRUD produtos + estoque
│           ├── SessoesPage.jsx       # CRUD sessões + catálogo
│           └── UsuariosPage.jsx      # placeholder "Em Desenvolvimento"
├── diagramas/                        # SVGs (classes, conceitual, DER)
├── docs/                             # material de aula (crud.md, html/docx/pdf)
├── .gitignore                        # segredos, build, artefatos temporários
├── README.md                         # leitura rápida (intro)
└── DOCUMENTACAO.md                   # 👈 este arquivo (status e docs)
```

---

## 4. O que já está implementado

### 4.1 Snack Bar — Produtos (completo, do template original)

- CRUD de produtos com **controle de estoque** (`quantidadeEstoque`, `estoqueMinimo`).
- `statusEstoque` automático: `NORMAL`, `BAIXO`, `ESGOTADO`.
- Filtros por `busca` (nome/categoria) e `categoria`.
- Endpoint `/api/produtos/{id}/estoque` (PATCH) para **entrada/saída** de estoque,
  com validação de saldo (`422` em saída maior que o saldo).
- Frontend: `ProdutosPage` — CRUD completo, badges de status, movimentação de estoque.

### 4.2 Fase 1 — Catálogo: Filme + Sala + integração OMDb

**Salas**
- Entidade `Sala`: `nomeNumero`, `capacidadeTotal`, timestamps.
- CRUD completo (`/api/salas`), validação de nome/sala duplicada.

**Filmes**
- Entidade `Filme`: `titulo`, `classificacaoEtaria`, `duracaoMinutos`, `sinopse`,
  `genero`, `posterUrl`, `diretor`, `imdbId`, timestamps.
- CRUD completo (`/api/filmes`).
- `POST /api/filmes/buscar?titulo=...` — consulta a **OMDb API** real e cadastra o
  filme retornado (procura por título exato; não duplica).
- `OmdbService` lê `omdb.base-url` e `omdb.api-key=${OMDB_API_KEY:}`. Sem a chave,
  retorna `422` com mensagem genérica (a chave **nunca** vaza na resposta nem no log).
- `OmdbConfig`: `RestTemplate` com timeouts (conexão/leitura) via `@ConfigurationProperties`.
- Frontend: `BuscaFilmeModal` (busca por título, libera cadastro do filme retornado)
  e dropdowns de filmes/salas na `SessoesPage`.

**Seeds (carga inicial):** 3 salas (Padrão 100, IMAX 250, VIP 150) e 3 filmes
(O Auto da Compadecida 2, Duna: Parte 2, Deadpool & Wolverine).

### 4.3 Fase 2 — Sessão Normalizada (modelo relacional)

**Entidade `Sessao`** com **FKs reais**:
- `filme` → `@ManyToOne(Filme)` (coluna `filme_id`)
- `sala` → `@ManyToOne(Sala)` (coluna `sala_id`)
- `dataHoraInicio`, `dataHoraFim` (`LocalDateTime`)
- `status` → enum `StatusSessao`: `DISPONIVEL`, `LOTADA`, `CANCELADA`, `ENCERRADA`
- `dataCadastro` / `dataAtualizacao` automáticos (`@PrePersist` / `@PreUpdate`)

**Endpoints `SessaoController` (`/api/sessoes`):**
- `GET /api/sessoes` — lista enriquecida: filme e sala aninhados (`FilmeResponseDTO`,
  `SalaResponseDTO`), `ingressosVendidos` (0 por enquanto) e `vagasDisponiveis`
  (capacidade da sala − vendidos).
- `GET /api/sessoes/{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`
  (respectivamente `200/200/201/200/204`, com `404` quando não existe).

**Regras de negócio (`SessaoService`):**
- `dataHoraFim` deve ser posterior a `dataHoraInicio` → `422`.
- **Conflito de horário na mesma sala**: `findConflitantes` (JPQL) detecta
  sobreposição `inicio < fim && fim > inicio`, ignorando sessões `CANCELADA` e a
  própria sessão no `PUT` → `422`.
- Filme/sala inexistentes → `404` antes de validar conflito (mensagens corretas).
- `POST` sempre cria com `DISPONIVEL`; `PUT` aceita `status` opcional (demais campos
  preservam o valor atual quando omitidos).
- Seed de 3 sessões (uma `ENCERRADA` para demonstração).

**Frontend `SessoesPage.jsx`:** CRUD de sessões com selects de filme/sala por id,
campos `datetime-local` (início/fim), badge e select de status, ocupação
(vendidos/capacidade com barra) e vagas restantes; scroll listagem.

### 4.4 Usuários

- `UsuariosPage` é **placeholder estático** ("Em Desenvolvimento"). Autenticação
  (Spring Security + JWT) prevista na Fase 4.

---

## 5. API — Resumo de Endpoints

| Método | Rota | Java | Mock | Observação |
|--------|------|:----:|:----:|------------|
| GET | `/api/produtos` | ✅ | ✅ | busca/categoria |
| POST | `/api/produtos` | ✅ | ✅ | |
| PUT | `/api/produtos/{id}` | ✅ | ✅ | |
| DELETE | `/api/produtos/{id}` | ✅ | ✅ | |
| PATCH | `/api/produtos/{id}/estoque` | ✅ | ✅ | entrada/saída |
| GET | `/api/salas` · `/api/salas/{id}` | ✅ | ✅ | |
| POST/PUT/DELETE | `/api/salas...` | ✅ | ✅ | duplicidade 422 |
| GET | `/api/filmes` · `/api/filmes/{id}` | ✅ | ✅ | |
| POST/PUT/DELETE | `/api/filmes...` | ✅ | ✅ | |
| POST | `/api/filmes/buscar?titulo=` | ✅ (OMDb real) | ✅ (simulado) | 422 sem chave |
| GET | `/api/sessoes` · `/api/sessoes/{id}` | ✅ | ✅ | enriquecido |
| POST | `/api/sessoes` | ✅ | ✅ | 201; conflito 422 |
| PUT | `/api/sessoes/{id}` | ✅ | ✅ | |
| DELETE | `/api/sessoes/{id}` | ✅ | ✅ | |
| GET | `/api/sessoes/{id}/assentos` | ❌ | ❌ | irá na Fase 3 |
| POST | `/api/ingressos/comprar` | ❌ | ❌ | irá na Fase 3 |
| POST | `/api/auth/login` | ❌ | ❌ | irá na Fase 4 |

**Formato de erro padrão (Java)** — `GlobalExceptionHandler`:
- `404` → `{"timestamp","status":404,"error":"Recurso Nao Encontrado","message":...}`
- `422` → `{"timestamp","status":422,"error":"Violacao de Regra de Negocio","message":...}`
- `400` → `{"timestamp","status":400,"error":"Dados Invalidos","errors":{campo:mensagem}}`

> Pendência: falta handler para `DataIntegrityViolationException` (duplicidade de
> `imdb_id`/`nome_numero` hoje viraria 500) e `HttpMessageNotReadableException`, além
> de fallback `Exception`.

---

## 6. Arquitetura e Decisões de Implementação

- **DTOs `record`** para request/response — separação da entidade JPA do contrato REST.
- **Derived queries + JPQL** no repositório; detecção de conflito em **SQL/JPA**,
  não em memória.
- **Constraint via Bean Validation** (`@NotNull`, `@NotBlank`) nos DTOs.
- **`@RestControllerAdvice`** centraliza erros → respostas JSON consistentes.
- **CORS centralizado no `CorsConfig`** via `app.cors.allowed-origins`
  (dev: `http://localhost:5173,http://127.0.0.1:5173`); origens fora → `403`.
  Headers permitidos: `Content-Type`, `Authorization`.
- **H2 console** ativo apenas local (`web-allow-others=false`).
- **Chave OMDb via environment**: `omdb.api-key=${OMDB_API_KEY:}`; erro sanitizado
  (mensagem genérica + log sem URL) para nunca expor a chave.
- **Seeds com `@Order` (1→4)**: produtos → salas → filmes → sessões (sessões
  dependem de filmes/salas já populados).
- **Mock em `127.0.0.1`** e com `toLocal()` em **wall-clock local** (evita deslocamento
  de fuso que quebraria a detecção de conflito); `POST /api/filmes/buscar` → `200`
  (novo e repetido), alinhado ao contrato Java.

---

## 7. Como Rodar e Testar

### 7.1 Requisitos
- Node.js ≥ 18 e npm (frontend + mock)
- JDK 17 e Maven (backend Java)

### 7.2 Frontend
```bash
cd frontend
npm install        # só na primeira vez
npm run dev        # http://localhost:5173
```
Build de produção: `npm run build` (output em `frontend/dist/`).

### 7.3 Backend — opção A: mock Node (demo sem Java/chave)
```bash
cd backend
PORT=8080 node server.js     # API em http://localhost:8080/api (bind 127.0.0.1)
```
O frontend dev chama `http://localhost:8080/api` (definido em `frontend/src/services/api.js`)
— para testar com o mock, suba-o na **8080**.

### 7.4 Backend — opção B: API Java (definitiva)
```bash
cd backend
mvn spring-boot:run     # porta padrão 8080; H2 em memória + seeds automáticos
```
- Rodar em outra porta (ex.: 9090): `mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=9090`
- Console H2 (local): http://localhost:8080/h2-console — JDBC URL `jdbc:h2:mem:cinemadb`, usuário `sa`, senha vazia.

### 7.5 Chave OMDb (opcional — melhora a busca de filmes)
```bash
OMDB_API_KEY=sua_chave mvn spring-boot:run   # Linux/macOS
# ou export OMDB_API_KEY=sua_chave antes do comando
```
Sem a chave o sistema funciona; só a busca OMDb retorna `422` com mensagem amigável.

### 7.6 Testes manuais rápidos (curl)
```bash
# Listar sessões enriquecidas
curl http://localhost:8080/api/sessoes

# Criar sessão (201)
curl -X POST http://localhost:8080/api/sessoes \
  -H "Content-Type: application/json" \
  -d '{"filmeId":1,"salaId":1,"dataHoraInicio":"2026-09-20T10:00","dataHoraFim":"2026-09-20T12:00"}'

# Conflito de horário na mesma sala (422)
curl -X POST http://localhost:8080/api/sessoes \
  -H "Content-Type: application/json" \
  -d '{"filmeId":1,"salaId":1,"dataHoraInicio":"2026-09-20T11:00","dataHoraFim":"2026-09-20T13:00"}'

# Fim antes do início (422)
curl -X POST http://localhost:8080/api/sessoes \
  -H "Content-Type: application/json" \
  -d '{"filmeId":1,"salaId":1,"dataHoraInicio":"2026-09-20T12:00","dataHoraFim":"2026-09-20T11:00"}'
```

---

## 8. Banco de Dados

- **Hoje:** H2 em memória (`jdbc:h2:mem:cinemadb`), com **seeds automáticos**
  (7 produtos, 3 salas, 3 filmes, 3 sessões). Dados **somem ao reiniciar**.
- **Planejado (Fase 6):** PostgreSQL (driver já no `pom.xml`; config comentada no
  `application.properties`), perfis dev/prod e migrações (Flyway).

---

## 9. Git — Branches e Commits

**Convenção:** commits são assinados como **DevKunoichi**
(`95485578+DevKunoichi@users.noreply.github.com`) — identidade usada no repo e
relacionada à conta GitHub.

| Commit | Branch | O que fez |
|--------|--------|-----------|
| `facf69a` | `fix/tailwind-v4-build` | Corrige renderização: plugin `@tailwindcss/vite` configurado (Tailwind v4) |
| `7c2c2a1` | `feat/fase1-sala-filme-omdb` | Fase 1: Sala, Filme, OMDb (service/config/DTOs/controllers/seeds), mock e `BuscaFilmeModal` |
| `e27e894` | `feat/fase1-sala-filme-omdb` | Segurança e limpeza pós-auditoria (CORS, chave OMDb, H2, mock, remoção de arquivos corrompidos) |
| `033c22e` | `feat/fase1-sala-filme-omdb` | Spring Boot 3.3.4 → **3.5.16** |
| `ebb90ec` | `feat/fase2-sessao-normalizada` | Fase 2: `Sessao` com FKs, `StatusSessao`, CRUD + conflito, mock e página refatorados |

**Remoto:** `origin` = `git@github.com:DevKunoichi/fatec-tcc.git`.

> ⚠️ As branches `fix/tailwind-v4-build`, `feat/fase1-sala-filme-omdb` e
> `feat/fase2-sessao-normalizada` **ainda não foram enviadas ao remoto** (push
> bloqueado por permissão — ver Pendências).

---

## 10. Controle de Status

### ✅ Concluído
- [x] Correção de renderização do frontend (Tailwind v4) — `facf69a`
- [x] **Fase 1** — Sala + Filme + integração OMDb — `7c2c2a1`
- [x] Auditoria de qualidade (clean code, boas práticas, versões, segurança)
- [x] **Lote de correções "Agora"** — `e27e894` + `033c22e`
- [x] **Fase 2** — Sessão normalizada — `ebb90ec`

**Entidades na API Java: 4 de 9 (44%)** — Produto, Sala, Filme, Sessao.

### ⏳ Pendências operacionais
| # | Item | Detalhe |
|---|------|---------|
| 1 | **Chave OMDb** | Aguardando a DevKunoichi fornecer a chave gratuita (https://www.omdbapi.com/apikey.aspx). |
| 2 | **Decisão: onde guardar a chave** | Opção A (recomendada): `spring-dotenv` + `backend/.env` gitignored. Opção B: variável de ambiente do SO. |
| 3 | **Push das branches** | Chave SSH local (`Leporoni`) sem permissão de escrita no repo `DevKunoichi/fatec-tcc`. Resolver: adicionar Leporoni como colaborador **ou** fork + PR. |
| 4 | **Teste do usuário** | Rodar Fases 1 e 2 localmente (frontend + mock na 8080 ou Java). |
| 5 | **Banco persistente** | H2 em memória hoje; PostgreSQL planejado na Fase 6. |

### 🔧 Melhorias mapeadas (auditoria) — status aberto
- **Alta:** API sem autenticação → Fase 4 (Spring Security + JWT).
- **Média:** tratamento de exceções incompleto (handlers p/ `DataIntegrityViolationException`,
  `HttpMessageNotReadableException`, fallback `Exception`, logs) — aplicar o quanto antes;
  `ddl-auto=update` + perfis dev/prod → Fase 6; H2 perder dados ao reiniciar → Fase 6;
  `show-sql=true` mover p/ perfil dev → Fase 6.
- **Média (frontend):** `baseURL` fixo `http://localhost:8080/api` (trocar por
  `VITE_API_URL`); erros de fetch só `console.error`; labels sem `htmlFor`/a11y;
  `lucide-react` instalado e não usado; ESLint sem config; nome `temp-react` no
  `package.json`/`index.html`.
- **Média (mock):** divergências menores de contrato (PUT filmes/salas ausentes no mock,
  sala duplicada aceita, JSON inválido engolido, body sem limite).
- **Média (docs):** `docs/crud.md` com referências quebradas.

### 🚀 Próximas fases
- **Fase 3 — Assentos + Ingressos:** `Assento` e `Ingresso` (JPA), mapa de assentos
  (`GET /api/sessoes/{id}/assentos`), compra (`POST /api/ingressos/comprar`) com
  validação (não vender assento já vendido/reservado), seed de assentos por sala;
  frontend `MapaAssentos.jsx` + fluxo de compra. *Nota: nessa fase passa a existir
  `ingressosVendidos` real e o `status LOTADA` automático da sessão.*
- **Fase 4 — Usuários + Segurança:** `Usuario`, Spring Security + JWT, `/api/auth/login`.
- **Fase 5 — Estoque audit + Pedidos:** `MovimentacaoEstoque` (auditoria) e
  `PedidoVenda` + relatórios.
- **Fase 6 — Infraestrutura e Limpeza:** perfis dev/prod, PostgreSQL + Flyway,
  handlers de exceção, `VITE_API_URL`, ESLint, renomear `temp-react`, corrigir docs.

---

## 11. Notas de Segurança (aplicadas)

- Chave OMDb só via variável de ambiente / propriedade; **nunca** em resposta, log ou repositório.
- CORS restrito a origens configuradas (403 para o resto).
- H2 console sem acesso remoto.
- `.gitignore` cobre `.env*`, `*.local`, builds, `node_modules`, artefatos temporários.
- Mock escuta apenas em `127.0.0.1`.

---

*Documentação criada em 2026-09-19. Última atualização acompanha o commit `ebb90ec` (Fase 2).*