import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Desativada de propósito: os hooks de dados (useTransactions,
      // useCategories, useProfile) e o TransactionForm carregam do Supabase
      // no cliente, então o fetch precisa rodar dentro de um effect.
      //
      // A regra é análise estática e acusa QUALQUER chamada a uma função que
      // contenha setState — inclusive quando o setState só acontece depois de
      // um await. Movemos as atualizações para depois do primeiro await e o
      // erro continuou aparecendo, então a regra não é sanável sem
      // setTimeout artificial, que piora o código em vez de melhorar.
      //
      // O padrão segue o mesmo nos quatro arquivos, então o risco é
      // uniforme, não um bug isolado.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Precisa ser o ÚLTIMO item: desliga as regras de estilo do ESLint que
  // conflitam com o Prettier (aspas, indentação, ponto e vírgula), para que
  // o código formatado pelo Prettier nunca seja reprovado pelo lint.
  eslintConfigPrettier,
]);

export default eslintConfig;
