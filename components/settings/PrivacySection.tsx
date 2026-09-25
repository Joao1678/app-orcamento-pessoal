'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import styles from './PrivacySection.module.css'

interface PrivacySectionProps {
  onExport: () => Promise<void>
  counts: { categories: number; transactions: number } | null
}

export function PrivacySection({ onExport, counts }: PrivacySectionProps) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  async function handleExport() {
    setBusy(true)
    setStatus(null)
    try {
      await onExport()
      setStatus({ kind: 'ok', text: 'Arquivo JSON gerado e baixado.' })
    } catch (err: unknown) {
      setStatus({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Não foi possível exportar seus dados.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Quais dados guardamos</h3>
        <p className={styles.text}>
          O FinanceFlow guarda o mínimo necessário para o app funcionar:
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Conta:</strong> e-mail, senha (armazenada apenas como hash, nunca em texto
            legível) e data de criação.
          </li>
          <li>
            <strong>Perfil:</strong> nome e o avatar que você escolheu entre as opções da aplicação.
          </li>
          <li>
            <strong>Seus registros:</strong>{' '}
            {counts
              ? `${counts.transactions} transação(ões) e ${counts.categories} categoria(s).`
              : 'suas transações e categorias.'}
          </li>
        </ul>
        <p className={styles.text}>
          Não vendemos, alugamos ou compartilhamos seus dados com anunciantes. Não usamos
          rastreamento de terceiros nem cookies de perfilamento — o app funciona só com o cookie de
          sessão.
        </p>
      </div>

      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Quem pode acessar</h3>
        <p className={styles.text}>
          Cada tabela do banco tem <strong>Row Level Security</strong> ativo: as políticas garantem,
          no próprio banco, que uma consulta só devolve linhas cujo dono é você. Isso vale mesmo que
          a checagem do front-end seja contornada — o banco recusa. Nenhum usuário enxerga dados de
          outro, e a equipe do projeto só acessa o banco por acesso administrativo.
        </p>
      </div>

      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Seus direitos sobre os dados</h3>
        <p className={styles.text}>
          Você pode acessar, corrigir e apagar seus dados a qualquer momento por esta página. Além
          de editar nome e e-mail, você pode baixar uma cópia de tudo o que temos sobre você e, se
          quiser encerrar, excluir a conta por completo na área de perigo abaixo.
        </p>

        <div className={styles.exportRow}>
          <Button
            type="button"
            variant="secondary"
            loading={busy}
            onClick={handleExport}
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
          >
            Baixar meus dados (JSON)
          </Button>
          <p className={styles.exportHint}>
            Gera um arquivo com seu perfil, categorias e transações, na sua máquina.
          </p>
        </div>

        {status && (
          <p className={status.kind === 'ok' ? styles.ok : styles.error} role="status">
            {status.text}
          </p>
        )}
      </div>
    </div>
  )
}
