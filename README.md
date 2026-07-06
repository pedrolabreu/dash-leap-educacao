# Pace de Vendas — LEAP

Dashboard de pace de vendas com filtro por expert e por período, comparando a receita
acumulada com uma meta definida para o período.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Fonte de dados

Os dados vêm da planilha "LEAP [CONTROLE DE VENDAS]" no Google Sheets, lidos via CSV
export (`/api/sales`, revalidado a cada 60s). A planilha precisa manter o
compartilhamento "qualquer pessoa com o link pode visualizar" (já configurado).

Para apontar para outra planilha/aba, veja `.env.example`.

## Estrutura

- `src/lib/csv.ts` — parsing do CSV (datas, valores em `R$`, colunas UTM).
- `src/lib/aggregate.ts` — filtros por data/expert, série de pace acumulado vs. meta,
  série diária, ranking por expert e KPIs.
- `src/app/api/sales/route.ts` — busca e parseia a planilha no servidor.
- `src/app/page.tsx` — dashboard (filtros, meta, gráficos, ranking por expert).

A meta do período é definida pelo usuário na própria tela e fica salva no navegador
(localStorage), por período selecionado.

## Deploy

Publicado no Vercel. Variáveis de ambiente opcionais em `.env.example`.
