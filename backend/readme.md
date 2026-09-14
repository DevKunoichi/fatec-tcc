# Backend — Sistema de Gerenciamento para Cinemas (FATEC TCC)

## 📌 Primeiro CRUD Implementado: Produtos & Estoque (Snacks / Bomboniere)

Conforme documentado no documento de requisitos (`DOC_CRUD1.pdf` - RF008, RF009, UC008 e regras RN003 e RF004) e na modelagem do sistema, este é o primeiro CRUD implementado por ser uma **entidade nuclear auto-contida**, sem dependências prévias de chaves estrangeiras.

---

### 🏛️ Arquitetura das Camadas (Padrão MVC + Spring Data JPA)

```text
backend/src/main/java/com/cinema/
 ├── CinemaApplication.java               # Classe principal + Seed inicial de produtos
 ├── entities/
 │    └── Produto.java                    # Entidade mapeada no banco com JPA
 ├── dtos/
 │    ├── ProdutoRequestDTO.java          # Validação de entrada (@NotBlank, @Positive, etc.)
 │    ├── ProdutoResponseDTO.java         # DTO com status (NORMAL, BAIXO, ESGOTADO)
 │    └── MovimentacaoEstoqueDTO.java     # DTO para entradas e saídas de estoque
 ├── repositories/
 │    └── ProdutoRepository.java          # Queries Spring Data JPA
 ├── services/
 │    └── ProdutoService.java             # Regras RN003 e RF004 (estoque não negativo)
 ├── controllers/
 │    └── ProdutoController.java          # Endpoints REST completos
 ├── exceptions/
 │    ├── ResourceNotFoundException.java  # HTTP 404
 │    └── RegraNegocioException.java      # HTTP 422
 └── config/
      ├── GlobalExceptionHandler.java     # Tratamento centralizado de erros
      └── CorsConfig.java                 # Habilita CORS para o frontend
```

---

### 🌐 Endpoints da API REST (`/api/produtos`)

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/produtos` | Lista todos os produtos (suporta `?busca=...` e `?categoria=...`) |
| `GET` | `/api/produtos/{id}` | Retorna detalhes de um produto específico |
| `POST` | `/api/produtos` | Cadastra novo produto |
| `PUT` | `/api/produtos/{id}` | Atualiza dados cadastrais de um produto |
| `DELETE` | `/api/produtos/{id}` | Remove um produto |
| `PATCH` | `/api/produtos/{id}/estoque` | Registra entrada ou saída no estoque com validação de saldo |

---

### 🚀 Como Executar

#### Opção A: Executar via Node.js (Pronto e Instantâneo — Zero Instalação)
Na pasta raiz do projeto:
```bash
node backend/server.js
```
*A API subirá imediatamente na porta `8080`, pronta para receber requisições do frontend e Postman/Insomnia.*

#### Opção B: Executar via Java / Spring Boot
Com o Maven ou na sua IDE (IntelliJ IDEA, Eclipse, VS Code):
```bash
cd backend
mvn spring-boot:run
```
* O H2 Console estará disponível em: `http://localhost:8080/h2-console`
* JDBC URL: `jdbc:h2:mem:cinemadb` (User: `sa`, Senha em branco)
