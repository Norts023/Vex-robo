-- ============================================================
-- Fase 1: esquema inicial, RLS e perfil automático no cadastro
-- Executar no SQL Editor do Supabase (ou via `supabase db push`).
-- ============================================================

-- ------------------------------------------------------------
-- Tabelas
-- ------------------------------------------------------------

-- Perfil de cada usuário (1:1 com auth.users)
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  nome            text not null default '' check (char_length(nome) <= 120),
  role            text not null default 'user'   check (role in ('user', 'admin')),
  status          text not null default 'ativo'  check (status in ('ativo', 'bloqueado')),
  plano           text not null default 'trial'  check (char_length(plano) between 1 and 40),
  data_fim_trial  timestamptz,
  criado_em       timestamptz not null default now()
);

-- Lançamentos do extrato (valor sempre positivo; o sinal vem de `tipo`)
create table public.transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  data       date not null,
  descricao  text not null check (char_length(descricao) between 1 and 200),
  valor      numeric(12, 2) not null check (valor > 0),
  categoria  text not null default 'Outros' check (char_length(categoria) between 1 and 60),
  tipo       text not null check (tipo in ('receita', 'despesa')),
  criado_em  timestamptz not null default now()
);

create index transactions_user_data_idx on public.transactions (user_id, data);

-- Dívidas. `taxa_juros_mensal` é em percentual (ex.: 12.5 = 12,5% ao mês).
create table public.debts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  nome               text not null check (char_length(nome) between 1 and 120),
  saldo              numeric(12, 2) not null check (saldo >= 0),
  taxa_juros_mensal  numeric(7, 4) not null check (taxa_juros_mensal >= 0 and taxa_juros_mensal <= 100),
  parcela_minima     numeric(12, 2) not null check (parcela_minima >= 0),
  criado_em          timestamptz not null default now()
);

create index debts_user_idx on public.debts (user_id);

-- ------------------------------------------------------------
-- Criação automática do perfil quando um usuário se cadastra
-- Período de teste de 7 dias já é gravado aqui (usado na Fase 4).
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nome, data_fim_trial)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'nome', ''), 120),
    now() + interval '7 days'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.transactions enable row level security;
alter table public.debts        enable row level security;

-- Perfil: o usuário lê o próprio registro e altera apenas o nome.
create policy "profiles: ler o próprio perfil"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: atualizar o próprio perfil"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Impede que o usuário altere role, status, plano ou data_fim_trial pelo navegador.
-- Só o servidor (service role / admin) poderá mudar esses campos.
revoke insert, update, delete on public.profiles from authenticated, anon;
grant update (nome) on public.profiles to authenticated;

-- Lançamentos e dívidas: cada usuário só enxerga e altera os próprios registros.
create policy "transactions: acesso aos próprios registros"
  on public.transactions for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "debts: acesso aos próprios registros"
  on public.debts for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.transactions from anon;
revoke all on public.debts from anon;

-- ------------------------------------------------------------
-- LGPD: o próprio usuário exclui a conta e todos os dados.
-- A exclusão em auth.users propaga (on delete cascade) para as demais tabelas.
-- ------------------------------------------------------------
create or replace function public.excluir_minha_conta()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = (select auth.uid());
$$;

revoke execute on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;
