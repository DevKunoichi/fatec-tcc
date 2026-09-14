# Frontend - React

Este diretório é reservado para a aplicação frontend em React.

## Passo a Passo para Inicializar o Projeto

Se você ainda não inicializou o projeto React, recomendamos o uso do **Vite** (uma ferramenta moderna e mais rápida que o tradicional Create React App).

### 1. Criando o projeto com Vite

A partir da raiz do seu projeto (`fatec-tcc`), você pode iniciar o React dentro da pasta `frontend` executando:

```bash
# Para React com JavaScript padrão:
npm create vite@latest frontend -- --template react

# Ou, se preferir usar TypeScript (Recomendado para projetos maiores):
npm create vite@latest frontend -- --template react-ts
```

*Nota: Se o terminal perguntar se deseja remover os arquivos existentes na pasta (já que a pasta frontend já foi criada), você pode confirmar se ela estiver vazia, ou você pode rodar `npm create vite@latest . -- --template react` de dentro da pasta `frontend`.*

### 2. Instalando as dependências

Acesse o diretório do frontend e instale as dependências criadas pelo Vite:
```bash
cd frontend
npm install
```

### 3. Rodando o servidor de desenvolvimento

Para iniciar a aplicação em ambiente de desenvolvimento, execute:
```bash
npm run dev
```

Acesse o link local gerado no terminal (geralmente `http://localhost:5173/`) para visualizar o app.

---

## Estrutura de Pastas Recomendada

À medida que o projeto cresce, organizar bem o código é fundamental. Dentro da pasta `src/` (que será gerada), uma estrutura comum e escalável é:

```text
src/
 ├── assets/        # Imagens, ícones, fontes, etc.
 ├── components/    # Componentes reutilizáveis (Botões, Modais, Inputs, etc.)
 ├── pages/         # Componentes que representam telas/rotas completas
 ├── services/      # Comunicação com a API (configurações do Axios/Fetch conectando ao backend)
 ├── contexts/      # Contextos do React para gerenciamento de estados globais (Context API)
 ├── hooks/         # Custom Hooks do React (ex: useAuth, useFetch)
 ├── utils/         # Funções auxiliares (formatação de data, moeda, etc.)
 ├── styles/        # Arquivos de estilo globais (CSS/SCSS)
 ├── App.jsx        # Componente raiz
 └── main.jsx       # Ponto de entrada que renderiza o App no DOM
```

## Próximos Passos (Bibliotecas Comuns)

Dependendo dos requisitos do seu TCC, você provavelmente precisará instalar:

* **Roteamento:** `npm install react-router-dom` (Para navegar entre diferentes páginas)
* **Requisições HTTP:** `npm install axios` (Para se comunicar com o seu Backend)
* **Estilização com Tailwind CSS:** Como você escolheu usar Tailwind, siga os passos abaixo logo após inicializar o projeto:

### Configurando o Tailwind CSS

1. **Instale o Tailwind e suas dependências:**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Configure os caminhos dos seus templates:**
   Abra o arquivo `tailwind.config.js` que foi gerado e adicione os caminhos de todos os seus arquivos para que o Tailwind saiba onde procurar por classes:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

3. **Adicione as diretivas do Tailwind no seu CSS principal:**
   Abra o arquivo `./src/index.css` (ou `App.css`) e adicione no topo:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

Pronto! Agora você já pode usar as classes utilitárias do Tailwind nos seus componentes React.

Se quiser que eu mesmo rode os comandos para inicializar o projeto Vite e já configure o Tailwind para você aqui no terminal, basta me avisar!
