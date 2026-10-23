# Finanças IA

Aplicação web de finanças pessoais com IA. Organiza extratos, dívidas e planos de quitação, e dá diagnósticos e dicas em linguagem simples.

> **Aviso:** o app oferece educação financeira e organização. Não é recomendação de investimentos.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (autenticação e Postgres) · Vercel

**Status:** Fase 1 concluída (base, login, cadastro, recuperação de senha, banco com RLS, dashboard protegido e exclusão de conta).

---

## Índice

1. [Configurar o Supabase (passo a passo)](#1-configurar-o-supabase-passo-a-passo)
2. [Rodar o projeto localmente](#2-rodar-o-projeto-localmente)
3. [Variáveis de ambiente](#3-variáveis-de-ambiente)
4. [Deploy na Vercel](#4-deploy-na-vercel)
5. [Privacidade e LGPD](#5-privacidade-e-lgpd)

---

## 1. Configurar o Supabase (passo a passo)

Faça estes passos **antes** de rodar o projeto. Os nomes dos menus podem mudar um pouco conforme a versão do painel do Supabase.

### 1.1 Criar o projeto

1. Acesse [supabase.com](https://supabase.com) e entre (ou crie uma conta).
2. Clique em **New project**.
3. Preencha:
   - **Name:** `financas-ia` (ou outro nome de sua preferência)
   - **Database Password:** gere uma senha forte e guarde-a em um gerenciador de senhas. Ela não vai para o `.env`.
   - **Region:** `South America (São Paulo)`, para menor latência no Brasil.
4. Clique em **Create new project** e aguarde a criação (leva alguns minutos).

### 1.2 Ativar a autenticação por e-mail e senha

1. No menu lateral, abra **Authentication → Sign In / Providers** (ou **Providers**).
2. Confirme que **Email** está **habilitado**.
3. Recomendado: mantenha **Confirm email** ligado. Assim o usuário confirma o e-mail antes de entrar.

### 1.3 Configurar as URLs de redirecionamento

Os links de confirmação de cadastro e de recuperação de senha precisam apontar para o seu app.

1. Abra **Authentication → URL Configuration**.
2. Em **Site URL**, informe:
   ```
   http://localhost:3000
   ```
   (Em produção, troque para a URL da Vercel, por exemplo `https://seu-app.vercel.app`.)
3. Em **Redirect URLs**, clique em **Add URL** e adicione:
   ```
   http://localhost:3000/auth/callback
   ```
   Para produção, adicione também `https://seu-app.vercel.app/auth/callback`.
4. Clique em **Save**.

### 1.4 Criar as tabelas, o RLS e o trigger

1. No menu lateral, abra **SQL Editor** e clique em **+ New query**.
2. Abra o arquivo `supabase/migrations/0001_schema_inicial.sql` deste repositório e **copie todo o conteúdo**.
3. Cole no editor e clique em **Run**.
4. Mensagem esperada: `Success. No rows returned`.

O script cria:

| Tabela | Conteúdo |
|---|---|
| `profiles` | Perfil de cada usuário: nome, `role` (`user`/`admin`), `status` (`ativo`/`bloqueado`), plano, `data_fim_trial` |
| `transactions` | Lançamentos: data, descrição, valor, categoria, tipo (`receita`/`despesa`) |
| `debts` | Dívidas: nome, saldo, taxa de juros mensal (%), parcela mínima |

Ele também:
- ativa **Row Level Security** nas três tabelas, para que cada usuário veja apenas os próprios dados;
- impede que o usuário altere `role`, `status`, `plano` ou `data_fim_trial` pelo navegador;
- cria automaticamente um perfil ao cadastrar, com 7 dias de teste;
- cria a função `excluir_minha_conta()`, usada pelo botão de exclusão de conta.

### 1.5 Conferir o resultado

1. Abra **Table Editor**.
2. Você deve ver `profiles`, `transactions` e `debts`.
3. Em cada tabela, o ícone de cadeado/escudo indica **RLS enabled**. Se aparecer aviso de que RLS está desligado, rode o script de novo.

### 1.6 Copiar as chaves da API

1. Abra **Project Settings → API** (ícone de engrenagem no menu lateral).
2. Copie:
   - **Project URL** → vai em `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key (em projetos novos pode aparecer como *publishable key*) → vai em `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> A chave `service_role` **nunca** deve ser colocada neste projeto nem em variáveis `NEXT_PUBLIC_`. Ela dá acesso irrestrito ao banco.

### 1.7 (Recomendado) Traduzir os e-mails

Em **Authentication → Email Templates**, traduza os textos de *Confirm signup* e *Reset password* para português. Mantenha o link `{{ .ConfirmationURL }}` em cada template.

### 1.8 Limite de envio de e-mails

O envio de e-mails embutido do Supabase tem limite baixo de envios por hora. Para uso real, configure um SMTP próprio em **Project Settings → Authentication → SMTP Settings** (*Custom SMTP*), por exemplo com Resend, Amazon SES ou SendGrid.

---

## 2. Rodar o projeto localmente

Requisitos: **Node.js 20.9 ou superior** e npm.

```bash
# 1. Instalar as dependências
npm install

# 2. Criar o arquivo de variáveis de ambiente
cp .env.example .env.local
# Edite .env.local e preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Subir o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Roteiro de teste da Fase 1

1. **Cadastro:** em `/cadastro`, crie uma conta com nome, e-mail e senha (mínimo 8 caracteres, com letra e número).
2. **Confirmação:** abra o e-mail recebido e clique no link. Você deve cair no dashboard.
3. **Proteção de rota:** tente abrir `/dashboard` sem estar logado. Você deve ser levado para `/login`.
4. **Login:** saia pelo botão **Sair** e entre de novo em `/login`.
5. **Recuperação:** em `/recuperar-senha`, peça o link, defina uma nova senha e entre com ela.
6. **Isolamento de dados (RLS):** crie uma segunda conta. Cada conta deve ver apenas os próprios indicadores. Dados de uma conta nunca aparecem na outra.
7. **Trial:** no **Table Editor → profiles**, confira que a linha do seu usuário tem `data_fim_trial` cerca de 7 dias à frente.
8. **Exclusão de conta:** no dashboard, digite `EXCLUIR` e confirme. A conta e os dados somem da tabela `auth.users` e das demais.

### Scripts disponíveis

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Roda o build de produção |
| `npm run typecheck` | Verifica os tipos TypeScript |

---

## 3. Variáveis de ambiente

Todas ficam em `.env.local` (desenvolvimento) ou em **Vercel → Settings → Environment Variables** (produção). Veja `.env.example`.

| Variável | Obrigatória | Onde usar | Descrição |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Sim | Servidor | URL pública do app. Usada nos links de e-mail. |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | Navegador e servidor | *Project URL* do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Navegador e servidor | Chave pública (*anon*/*publishable*). O RLS protege os dados. |
| `ANTHROPIC_API_KEY` | Fase 2 | **Somente servidor** | Análises com IA |
| `MERCADOPAGO_ACCESS_TOKEN` | Fase 4 | **Somente servidor** | Pagamentos |

Nunca coloque chaves secretas em variáveis com prefixo `NEXT_PUBLIC_`, porque elas vão para o navegador.

---

## 4. Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Na [Vercel](https://vercel.com), clique em **Add New → Project** e importe o repositório.
3. Framework: **Next.js** (detectado automaticamente).
4. Em **Environment Variables**, adicione as variáveis da seção 3. Use a URL da Vercel em `NEXT_PUBLIC_SITE_URL`.
5. Clique em **Deploy**.
6. Depois do primeiro deploy, volte ao Supabase (seção 1.3) e confirme que a URL da Vercel está em **Site URL** e em **Redirect URLs** (`https://seu-app.vercel.app/auth/callback`).

O banco não precisa de deploy separado. O script SQL da seção 1.4 já fica ativo no mesmo projeto Supabase usado em produção. Para mudanças futuras no banco, crie um novo arquivo em `supabase/migrations/` e rode-o no SQL Editor.

---

## 5. Privacidade e LGPD

- O app **não pede senhas de bancos ou de internet banking**. Os dados entram somente por arquivo CSV (Fase 2).
- Coletamos só o necessário: nome, e-mail, senha (armazenada com hash pelo Supabase Auth) e os lançamentos e dívidas que o próprio usuário cadastra.
- Cada usuário vê apenas os próprios dados, garantido por **RLS** no Postgres.
- O usuário pode **excluir a conta e todos os dados** pelo dashboard. A exclusão é definitiva.

---

## Estrutura do projeto

```
app/
  auth/actions.ts        Server Actions: cadastro, login, recuperação, sair, excluir conta
  auth/callback/route.ts Recebe os links dos e-mails (confirmação e recuperação)
  login/                 Tela de login
  cadastro/              Tela de cadastro
  recuperar-senha/       Pede o link de recuperação
  redefinir-senha/       Define a nova senha
  dashboard/             Página protegida
components/              Formulários e elementos de interface
lib/
  supabase/              Clientes do Supabase (servidor e proxy) e configuração
  validations/auth.ts   Regras de validação (Zod), usadas no servidor
proxy.ts                 Renova a sessão e protege as rotas
supabase/migrations/     Esquema SQL, RLS e funções
```
