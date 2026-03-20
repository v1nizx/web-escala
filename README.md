# ✝ Web Escala PASCOM

Sistema web PWA mobile-first para gestão de escalas de serviço da Pastoral da Comunicação.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Instalável-5A0FC8)

## 📋 Funcionalidades

- **Escala pública**: voluntários visualizam a escala sem login
- **Painel admin**: criar, editar e deletar escalas (requer autenticação)
- **Gestão de membros**: adicionar, ativar/desativar e deletar voluntários
- **Navegação por mês**: botões ‹ › para navegar entre meses
- **Compartilhar no WhatsApp**: gera texto formatado da escala da semana
- **Indicador visual**: destaque para escalas da semana atual
- **PWA instalável**: funciona offline e pode ser adicionado à tela inicial

## 🚀 Configuração

### 1. Criar projeto no Firebase Console

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um novo projeto (ex: `web-escala-pascom`)
3. **Firestore Database**: Crie um banco no modo produção
4. **Authentication**: Habilite o provedor **E-mail/Senha**
5. Crie um usuário admin em Authentication → Users → Add user
6. **Hosting**: Ative o Firebase Hosting (opcional, para deploy)
7. Em **Configurações do projeto** → **Apps** → **Web** (</>), registre um app web e copie as credenciais

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Preencha o arquivo `.env` com as credenciais do Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 3. Criar índice no Firestore

O sistema usa uma query composta na coleção `escalas`. Crie o índice:

1. No Firebase Console → Firestore → **Índices**
2. Adicione um índice composto:
   - Coleção: `escalas`
   - Campos: `data` (Crescente)
   - Status da query: Ativar

> **Dica**: O Firebase mostrará um link no console do navegador para criar o índice automaticamente na primeira query.

### 4. Rodar localmente

```bash
npm install
npm run dev
```

O app estará disponível em `http://localhost:5173`

### 5. Deploy no Firebase Hosting

```bash
# Instalar Firebase CLI (se necessário)
npm install -g firebase-tools

# Login no Firebase
firebase login

# Vincular ao projeto
firebase use --add

# Build e deploy
npm run build
firebase deploy
```

## 📁 Estrutura do Projeto

```
src/
  firebase/
    config.js         ← Inicialização do Firebase
    escalas.js        ← CRUD de escalas (Firestore)
    membros.js        ← CRUD de membros (Firestore)
  contexts/
    AuthContext.jsx    ← Contexto de autenticação
  components/
    Navbar.jsx         ← Barra de navegação
    EscalaCard.jsx     ← Card de escala com badge de função
    PrivateRoute.jsx   ← Guard de rota autenticada
    SkeletonCard.jsx   ← Skeleton loading
  pages/
    EscalaPage.jsx     ← Página pública com escalas do mês
    LoginPage.jsx      ← Login do admin
    AdminPage.jsx      ← Painel de gestão de escalas
    MembrosPage.jsx    ← Gestão de voluntários
```

## 🔒 Regras de Segurança (Firestore)

```
escalas → leitura: pública | escrita: autenticado
membros → leitura: pública | escrita: autenticado
```

## 🎨 Funções e suas cores

| Função   | Cor    | Emoji |
|----------|--------|-------|
| Câmera   | Azul   | 📹    |
| Stories  | Roxo   | 📱    |
| Apoio    | Cinza  | 🤝    |

## 📱 PWA

O app é instalável como PWA. Para instalar:
1. Acesse o site no navegador do celular
2. Toque em "Adicionar à tela inicial" (ou o menu do navegador)
3. O app aparecerá como um ícone na tela inicial

## 📄 Licença

MIT
