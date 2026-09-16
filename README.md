# 🎬 CRUD Cinema - Sistema de Bilheteria e Estoque

Este é o repositório do sistema de gestão para cinemas (Cine Novelino), contendo a aplicação frontend moderna desenvolvida com React e Vite, além da integração com a API de backend.

## 🚀 Tecnologias Utilizadas

**Frontend (pasta `/frontend`):**
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/) - Ferramenta de build rápida
- [Tailwind CSS](https://tailwindcss.com/) - Estilização rápida e responsiva
- [React Router](https://reactrouter.com/) - Navegação entre páginas
- [Axios](https://axios-http.com/) - Comunicação com a API
- [Lucide React](https://lucide.dev/) - Ícones

**Backend:**
- Java Spring Boot / Node.js (rodando localmente na porta `8080`)

## 📂 Estrutura do Projeto

- `/frontend` - Contém todo o código da interface do usuário (UI).
- *(Demais pastas do repositório correspondem à API e ao Backend)*

## 🛠️ Como rodar o projeto localmente

### 1. Inicializando a API (Backend)
Antes de ligar o frontend, certifique-se de que o backend esteja rodando e disponível em `http://localhost:8080`.

### 2. Inicializando o Frontend
Abra o seu terminal, navegue até a pasta `frontend` e execute os seguintes comandos:

```bash
# 1. Navegue para a pasta do frontend
cd frontend

# 2. Instale as dependências (necessário apenas na primeira vez)
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

O terminal exibirá um link (geralmente `http://localhost:5173`). Clique nele para abrir a aplicação no seu navegador.

## 📝 Funcionalidades Principais
- **Produtos & Estoque:** Gerenciamento completo (Criar, Ler, Atualizar, Deletar) do estoque da bomboniere do cinema integrado em tempo real com o banco de dados.
- **Sessões:** Gestão das sessões de filmes disponíveis.
- **Usuários:** Controle de acesso de funcionários e perfis.

---
*Projeto de Trabalho de Conclusão de Curso (TCC) - FATEC.*
