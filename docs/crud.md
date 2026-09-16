# Implementação do CRUD - Sistema de Gerenciamento Integrado para Cinemas

Com base no documento de requisitos, a implementação do backend será estruturada para suportar as regras de negócio, a segurança e os fluxos descritos nos casos de uso.

## 1. Arquitetura e Stack Tecnológico
*   **Linguagem/Framework:** Java 17+ com Spring Boot (facilita a criação rápida de APIs REST).
*   **Banco de Dados:** PostgreSQL (banco relacional robusto para garantir a integridade e transações como vendas e estoque).
*   **ORM:** Spring Data JPA (Hibernate) para mapeamento objeto-relacional.
*   **Segurança:** Spring Security + JWT (JSON Web Token) para controle de acesso (Perfis: Administrador, Gerente, Atendente e Cliente).
*   **Migrações de Banco:** Flyway ou Liquibase para versionamento das tabelas.

---

## 2. Modelagem de Dados (PostgreSQL)
Para atender aos requisitos, as seguintes entidades principais (tabelas) serão necessárias:

*   **Usuario:** `id`, `nome`, `email`, `senha_hash`, `perfil` (Admin, Gerente, Cliente, etc.).
*   **Filme:** `id`, `titulo`, `classificacao_etaria`, `duracao_minutos`, `sinopse`.
*   **Sala:** `id`, `nome_numero`, `capacidade_total`.
*   **Sessao:** `id`, `filme_id`, `sala_id`, `data_hora_inicio`, `data_hora_fim`.
*   **Assento:** `id`, `sala_id`, `fileira`, `numero`.
*   **Ingresso:** `id`, `sessao_id`, `assento_id`, `usuario_id`, `valor`, `status` (Disponível, Reservado, Vendido, Utilizado).
*   **Produto (Snack):** `id`, `nome`, `preco`, `quantidade_estoque`.
*   **MovimentacaoEstoque:** `id`, `produto_id`, `tipo` (Entrada/Saida), `quantidade`, `data`.
*   **Pedido/Venda:** `id`, `usuario_id`, `valor_total`, `forma_pagamento`, `data_venda`.

> 📊 **Diagramas do Sistema (Pasta `Docs/`):**
> * [**Diagrama Conceitual (MER)**](Docs/diagrama_conceitual.svg) — Notação Peter Chen com entidades, relacionamentos e cardinalidades.
> * [**Diagrama Lógico/Relacional (DER)**](Docs/diagrama_der.svg) — Esquema relacional PostgreSQL com PKs, FKs e notação Crow's Foot.
> * [**Diagrama de Classes UML**](Docs/diagrama_classes.svg) — Modelagem orientada a objetos (Spring Boot JPA).
> * [**Visualizador Interativo Web**](Docs/visualizar_diagramas.html) — Galeria interativa para apresentação e impressão/PDF.

---

## 3. Estrutura do Projeto (Padrão MVC/Camadas)
```text
src/main/java/com/cinema
 ├── controllers/    # Endpoints REST (ex: SessaoController, VendaController)
 ├── services/       # Regras de Negócio e validações (RN001 a RN005)
 ├── repositories/   # Interfaces do Spring Data JPA para acesso ao PostgreSQL
 ├── entities/       # Classes mapeadas para o banco (@Entity)
 ├── dtos/           # Objetos de Transferência (Request/Response)
 ├── config/         # Configurações do sistema (Cors, Swagger)
 └── security/       # Filtros e validações de tokens JWT
```

---

## 4. Implementação dos Casos de Uso (Endpoints da API)

### 4.1. Controle de Usuários (UC001 e UC002)
*   `POST /api/usuarios`: Cadastra um novo usuário (valida e-mail duplicado).
*   `POST /api/auth/login`: Autentica o usuário e retorna o token JWT.

### 4.2. Gerenciamento de Filmes e Sessões (UC003)
*   `POST /api/filmes`: Cadastra novos filmes (Acesso: Gerente).
*   `POST /api/sessoes`: Cadastra sessões.
    *   **Regra (RN002):** O `SessaoService` deve fazer uma query no banco verificando se há alguma sessão na mesma `sala_id` que conflite com os horários informados.
*   `GET /api/sessoes`: Lista as sessões disponíveis, podendo filtrar por data.

### 4.3. Venda de Ingressos e Assentos (UC004, UC005, UC006)
*   `GET /api/sessoes/{id}/assentos`: Retorna todos os assentos da sala daquela sessão, cruzando com a tabela de Ingressos para marcar quais estão "Disponíveis" ou "Ocupados".
*   `POST /api/ingressos/comprar`:
    *   **Regra (RN001 - Unicidade):** Uso de *Pessimistic Locking* (ou *Optimistic Locking* via JPA `@Version`) para garantir que 2 pessoas não comprem o mesmo assento no mesmo milissegundo.
    *   **Regra (RN004 - Classificação Etária):** O Service verifica a idade do `usuario_id` logado em relação à classificação do filme.
*   `POST /api/pagamentos`: Confirma a transação. Se falhar, o assento volta a ficar "Disponível".

### 4.4. Produtos e Balcão de Snacks (UC007 e UC008)
*   `GET /api/produtos`: Lista o cardápio.
*   `POST /api/produtos/venda`: 
    *   **Regra (RN003 - Estoque):** Inicia uma transação no banco (`@Transactional`). Verifica se `quantidade_solicitada <= quantidade_estoque`. Se sim, efetua a venda e deduz do banco de forma atômica.
*   `POST /api/estoque/entrada`: Registra reposição de estoque (Acesso: Gerente).

### 4.5. Validação na Entrada (UC009)
*   `POST /api/ingressos/validar`: O funcionário envia o ID/QR Code do ingresso. O sistema checa no PostgreSQL se o ingresso existe, se pertence à sessão atual e se o status é "Vendido". Em caso de sucesso, altera o status para "Utilizado" para impedir dupla entrada.

### 4.6. Relatórios (UC010)
*   `GET /api/relatorios/vendas`: Endpoint restrito a gerentes. Utiliza queries customizadas no JPA (JPQL ou Native Query) filtrando `GROUP BY` data, tipo de produto ou filme, para calcular o faturamento e as taxas de ocupação das salas.

---

## 5. Práticas Recomendadas Adicionais
1.  **Transações Seguras:** Todo fluxo de venda (ingresso ou produto) deve estar sob a anotação `@Transactional` do Spring. Se o pagamento falhar no final, todo o banco sofre *rollback* automático.
2.  **Tratamento de Exceções:** Implementar um `@ControllerAdvice` para capturar exceções de negócio (ex: `AssentoIndisponivelException`, `EstoqueInsuficienteException`) e retornar códigos HTTP corretos (como 409 Conflict ou 400 Bad Request) junto com mensagens claras para o Frontend.

---

## 6. Status de Implementação dos CRUDs

### ✅ CRUD 01 Implementado: Produtos & Estoque (Snacks / Bomboniere)
* **Motivo da Escolha:** É a entidade mais simples e auto-contida do sistema (sem dependências de chaves estrangeiras prévias).
* **Backend Java / Spring Boot:** Estruturado em [`backend/src/main/java/com/cinema/`](backend/src/main/java/com/cinema/) com `Produto`, `ProdutoRepository`, `ProdutoService`, `ProdutoController`, DTOs e `GlobalExceptionHandler`.
* **API REST Executável:** Arquivo [`backend/server.js`](backend/server.js) para rodar a API imediatamente com `node backend/server.js` na porta 8080.
* **Interface Web Interativa:** Arquivo [`frontend/crud_produtos.html`](frontend/crud_produtos.html) pronto para teste visual completo com cadastro, edição, exclusão e controle de estoque.

