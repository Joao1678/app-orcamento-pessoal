Toda lógica que envolva valores monetários deve:
Usar `Decimal` (Python) ou `big.js` / `decimal.js` (JS/TS) em vez de `float` ou `number` nativo para evitar erros de arredondamento em cálculos financeiros.
Validar e rejeitar entradas negativas em campos de receita, e entradas positivas em campos de despesa, salvo quando o domínio explicitamente permita.
Nunca exibir valores financeiros sem formatação de moeda (ex: `R$ 1.250,00`), respeitando o locale `pt-BR`.
Incluir testes unitários para qualquer função de cálculo (saldo, total de categoria, projeção mensal).

Por se tratar de uma aplicação que lida com dados financeiros pessoais sensíveis:
Nunca logar, imprimir ou expor valores de transações, saldos ou dados de usuário em `console.log`, `print` ou arquivos de log em ambiente de produção.
Dados financeiros não devem ser armazenados em `localStorage` ou `sessionStorage` sem criptografia.
Toda comunicação com APIs externas deve usar HTTPS e incluir tratamento explícito de erros de autenticação (401/403).
Ao gerar seeds, mocks ou dados de teste, usar apenas valores fictícios — nunca reutilizar ou hardcodar dados reais de usuário no código.