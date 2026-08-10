-- Schema for the LEAP dashboard's goals data ("metas"), to run in the
-- Supabase project that already holds the vendas table (SQL editor →
-- New query → paste → Run). Mirrors the shapes the app already reads from
-- the Google Sheets tabs, so nothing else in the app needs to change once
-- SUPABASE_URL / SUPABASE_ANON_KEY are set in Vercel.
--
-- Read-only from the app's side: RLS policies below allow SELECT with the
-- anon key. Insert/update rows via the Supabase table editor, or with the
-- service role key from a trusted context — never expose that key to the app.

create table if not exists public.metas_mes (
  mes date primary key,       -- first day of the month, e.g. 2026-08-01
  empresa numeric,
  comercial numeric
);

create table if not exists public.metas_mes_vendedor (
  mes date not null references public.metas_mes (mes) on delete cascade,
  vendedor text not null,
  meta numeric,
  primary key (mes, vendedor)
);

create table if not exists public.metas_dia (
  data date primary key,
  meta_equipe numeric not null default 0,       -- meta comercial da equipe
  meta_por_vendedor numeric not null default 0, -- meta individual, por vendedor
  meta_fat_global numeric not null default 0    -- meta de faturamento total da empresa
);

alter table public.metas_mes enable row level security;
alter table public.metas_mes_vendedor enable row level security;
alter table public.metas_dia enable row level security;

create policy "Public read metas_mes" on public.metas_mes
  for select using (true);
create policy "Public read metas_mes_vendedor" on public.metas_mes_vendedor
  for select using (true);
create policy "Public read metas_dia" on public.metas_dia
  for select using (true);

-- Seed: agosto/2026 (mesmos números repassados para o dashboard).
insert into public.metas_dia (data, meta_equipe, meta_por_vendedor, meta_fat_global)
values
  ('2026-08-01', 6410, 3205, 9073),
  ('2026-08-02', 3205, 1602.5, 4980),
  ('2026-08-03', 21795, 10897.5, 28008),
  ('2026-08-04', 18590, 9295, 24359),
  ('2026-08-05', 15385, 7692.5, 20267),
  ('2026-08-06', 13462, 6731, 17900),
  ('2026-08-07', 11538, 5769, 15532),
  ('2026-08-08', 9615, 4807.5, 12278),
  ('2026-08-09', 0, 0, 1775),
  ('2026-08-10', 0, 0, 6657),
  ('2026-08-11', 26374, 13187, 59405),
  ('2026-08-12', 21578, 10789, 48925),
  ('2026-08-13', 3537, 1768.5, 11956),
  ('2026-08-14', 2948, 1474, 10334),
  ('2026-08-15', 983, 491.5, 5072),
  ('2026-08-16', 590, 295, 3399),
  ('2026-08-17', 199846, 99923, 262459),
  ('2026-08-18', 246323, 123161.5, 320203),
  ('2026-08-19', 12945, 6472.5, 19750),
  ('2026-08-20', 10808, 5404, 16649),
  ('2026-08-21', 10036, 5018, 15346),
  ('2026-08-22', 3563, 1781.5, 5695),
  ('2026-08-23', 2138, 1069, 3553),
  ('2026-08-24', 19274, 9637, 29448),
  ('2026-08-25', 5325, 2662.5, 11008),
  ('2026-08-26', 4438, 2219, 9362),
  ('2026-08-27', 3772, 1886, 8069),
  ('2026-08-28', 3328, 1664, 7134),
  ('2026-08-29', 1109, 554.5, 2678),
  ('2026-08-30', 665, 332.5, 1742),
  ('2026-08-31', 70000, 35000, 83384)
on conflict (data) do update set
  meta_equipe = excluded.meta_equipe,
  meta_por_vendedor = excluded.meta_por_vendedor,
  meta_fat_global = excluded.meta_fat_global;

-- Seed: metas_mes / metas_mes_vendedor de agosto (totais derivados da
-- tabela diária acima — só usados como fallback quando metas_dia não tem
-- linhas para o mês). Ajuste os nomes dos vendedores se não forem
-- Lucas/Anderson.
insert into public.metas_mes (mes, empresa, comercial)
values ('2026-08-01', 1076400, 749580)
on conflict (mes) do update set empresa = excluded.empresa, comercial = excluded.comercial;

insert into public.metas_mes_vendedor (mes, vendedor, meta)
values
  ('2026-08-01', 'Lucas', 374790),
  ('2026-08-01', 'Anderson', 374790)
on conflict (mes, vendedor) do update set meta = excluded.meta;
