# FinanceFlow — regras para agentes de IA

> Este arquivo é lido automaticamente por agentes que trabalham neste projeto.
> As regras abaixo são obrigatórias.

## Segurança e privacidade dos dados do usuário

Por se tratar de uma aplicação que lida com dados financeiros pessoais sensíveis:

- Nunca logar, imprimir ou expor valores de transações, saldos ou dados de usuário em `console.log`, `print` ou arquivos de log em ambiente de produção.
- Dados financeiros não devem ser armazenados em `localStorage` ou `sessionStorage` sem criptografia.
- Toda comunicação com APIs externas deve usar HTTPS e incluir tratamento explícito de erros de autenticação (401/403).
- Ao gerar seeds, mocks ou dados de teste, usar apenas valores fictícios — nunca reutilizar ou hardcodar dados reais de usuário no código.

## Integridade e validação de dados financeiros

Toda lógica que envolva valores monetários deve:

- Usar `Decimal` (Python) ou `big.js` / `decimal.js` (JS/TS) em vez de `float` ou `number` nativo para evitar erros de arredondamento em cálculos financeiros.
- Validar e rejeitar entradas negativas em campos de receita, e entradas positivas em campos de despesa, salvo quando o domínio explicitamente permita.
- Nunca exibir valores financeiros sem formatação de moeda (ex: `R$ 1.250,00`), respeitando o locale `pt-BR`.
- Incluir testes unitários para qualquer função de cálculo (saldo, total de categoria, projeção mensal).

## Versões e convenções do ambiente (Regra 2)

Verifique estas versões antes de assumir qualquer padrão. Elas **divergem de
versões antigas** do framework e de conhecimento generalista:

| Pacote | Versão | Consequência prática |
| --- | --- | --- |
| `next` | 16.3.6 | O middleware virou **`proxy.ts`** na raiz do projeto — não existe `middleware.ts`. Turbopack é o bundler padrão. |
| `react` / `react-dom` | 19.2.8 | Efeitos com `setState` síncrono são desaconselhados (regra `react-hooks/set-state-in-effect`). |
| `@supabase/ssr` | 0.12.7 | Sessão em **cookies**, não em `localStorage`. Sempre `getAll`/`setAll`. |
| `@supabase/supabase-js` | 2.117.1 | Chaves no formato novo `sb_publishable_…` (não mais `anon`). |
| `decimal.js` | 10.6.0 | Aritmética de dinheiro. Não substitua por `number`. |
| `vitest` | 5.0.2 | Exige `@types/node` `^22 \|\| >=24` (o projeto usa `^24`). |
| Node | v24 | Runtime local. |

Docs da versão instalada: `node_modules/next/dist/docs/`. Não trust em memória
sobre Next.js — leia o que está lá.

## Como isso é aplicado neste repositório

- Aritmética de dinheiro: `lib/finance/calculate.ts` (usa `decimal.js`). Não somar valores monetários com `reduce`/`+` sobre `number` — passe a lista para `sumByType`, `summarizePeriod`, `summarizeByCategory` ou `projectMonthlyTotals`.
- Formatação: `lib/utils/formatCurrency.ts` (`Intl.NumberFormat`, `pt-BR`/BRL). Não montar string de moeda na mão, nem para eixos de gráfico — use `notation: 'compact'`.
- Erros 401/403: `lib/supabase/errors.ts` (`classifyError`, `friendlyErrorMessage`). Não exibir `error.message` cru do Supabase ao usuário.
- Sinais do valor: o `amount` é sempre positivo e o sinal vem do campo `type` (`income`/`expense`). O banco reforça isso com `CHECK (amount > 0)`.
- Integridade no banco (Regra 3): o gatilho `private.validate_transaction_category` recusa categoria de outro usuário **e** categoria cujo `type` não bate com o da transação. Não confie só no filtro do `TransactionForm`.
- Exclusão destrutiva (Regra 1): `DangerZone` exige três confirmações e oferece exportar os dados antes. `auth.admin.deleteUser` só deve ser chamado depois disso.
- Testes: `npm test` (vitest). Toda função de cálculo nova entra em `*.test.ts`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
