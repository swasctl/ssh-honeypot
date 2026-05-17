import type { Stats } from '../api'

const typeColor: Record<string, string> = {
  wordlist: 'var(--red)',
  default: 'var(--amber)',
  targeted: 'var(--accent)',
}

const typeLabel: Record<string, string> = {
  wordlist: 'WORDLIST',
  default: 'DEFAULT',
  targeted: 'TARGETED',
}

interface Props {
  credentials: Stats['credential_intel']
}

export default function CredentialIntel({ credentials }: Props) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderTop: '2px solid var(--border)',
      padding: '1rem 1.25rem',
      fontFamily: 'var(--mono)',
    }}>
      <div style={{ color: 'var(--text-dim)', fontSize: '0.65rem', letterSpacing: '0.15em', marginBottom: '1rem' }}>
        CREDENTIAL INTEL
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 1fr 1fr', gap: '0.25rem', marginBottom: '0.5rem', fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
        <span>TYPE</span>
        <span>PASSWORD</span>
        <span>COUNT</span>
      </div>
      {credentials.map((c, i) => (
        <div key={i} style={{
          display: 'grid',
          gridTemplateColumns: '0.6fr 1fr 1fr',
          gap: '0.25rem',
          padding: '0.4rem 0',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.75rem',
          alignItems: 'center',
        }}>
          <span style={{
            color: typeColor[c.type],
            fontSize: '0.6rem',
            letterSpacing: '0.08em',
          }}>
            {typeLabel[c.type] ?? c.type.toUpperCase()}
          </span>
          <span style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>{c.password}</span>
          <span style={{ color: 'var(--text-dim)' }}>{c.count}×</span>
        </div>
      ))}
      <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
        wordlist = known botnet dict · default = factory creds · targeted = manual
      </div>
    </div>
  )
}