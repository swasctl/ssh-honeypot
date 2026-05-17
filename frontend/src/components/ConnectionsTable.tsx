import { motion } from 'framer-motion'
import type { Connection } from '../api'

const resultColor: Record<string, string> = {
  AUTH_OK: 'var(--accent)',
  FAILED: 'var(--red)',
}

interface Props {
  connections: Connection[]
}

export default function ConnectionsTable({ connections }: Props) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderTop: '2px solid var(--border)',
      fontFamily: 'var(--mono)',
    }}>
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '0.7rem', letterSpacing: '0.15em' }}>
        ALL CONNECTIONS — including failed handshakes
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr 1.5fr 1fr 0.5fr 0.8fr 0.8fr', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.1em', gap: '0.5rem' }}>
        <span>IP</span>
        <span>COUNTRY</span>
        <span>CLIENT</span>
        <span>RESULT</span>
        <span>ABUSE</span>
        <span>FAILURE</span>
        <span>TIME</span>
      </div>
      {connections.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 0.5fr 1.5fr 1fr 0.5fr 0.8fr 0.8fr',
            padding: '0.5rem 1rem',
            borderBottom: '1px solid var(--border)',
            fontSize: '0.75rem',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ color: c.result === 'AUTH_OK' ? 'var(--accent)' : 'var(--text-dim)' }}>
            {c.ip}
          </span>
          <span style={{ color: 'var(--text-dim)' }}>{c.country_code ?? '—'}</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{c.client_version}</span>
          <span style={{ color: resultColor[c.result] ?? 'var(--text-dim)', fontSize: '0.7rem' }}>
            {c.result}
          </span>
          <span style={{
            color: c.abuse_score !== null && c.abuse_score > 50 ? 'var(--red)' : 'var(--text-dim)',
            fontSize: '0.7rem',
            fontWeight: c.abuse_score !== null && c.abuse_score > 80 ? 700 : 400,
          }}>
            {c.abuse_score !== null ? `${c.abuse_score}` : '—'}
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>
            {c.failure_reason?.slice(0, 20) ?? '—'}
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>
            {new Date(c.timestamp).toLocaleTimeString()}
          </span>
        </motion.div>
      ))}
    </div>
  )
}