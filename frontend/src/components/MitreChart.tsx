import { motion } from 'framer-motion'
import type { Stats } from '../api'

const mitreColors: Record<string, string> = {
  automated_bot: 'var(--text-dim)',
  credential_stuffing: 'var(--amber)',
  manual_attacker: 'var(--red)',
  reconnaissance: 'var(--red)',
  unknown: 'var(--text-dim)',
}

const mitreIds: Record<string, string> = {
  automated_bot: 'T1110.001',
  credential_stuffing: 'T1110.004',
  manual_attacker: 'T1059',
  reconnaissance: 'T1082',
  unknown: 'T1078',
}

interface Props {
  classifications: Stats['classifications']
}

export default function MitreChart({ classifications }: Props) {
  const max = Math.max(...classifications.map(c => c.count), 1)

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderTop: '2px solid var(--border)',
      padding: '1rem 1.25rem',
      fontFamily: 'var(--mono)',
    }}>
      <div style={{ color: 'var(--text-dim)', fontSize: '0.65rem', letterSpacing: '0.15em', marginBottom: '1rem' }}>
        MITRE ATT&CK OBSERVED
      </div>
      {classifications.length === 0 && (
        <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>No classifications yet</div>
      )}
      {classifications.map((c, i) => {
        const color = mitreColors[c.classification] ?? 'var(--accent)'
        const mitre = mitreIds[c.classification] ?? '—'
        const pct = (c.count / max) * 100
        return (
          <div key={i} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <div>
                <span style={{ color, fontSize: '0.75rem' }}>
                  {c.classification.replace(/_/g, ' ')}
                </span>
                <span style={{ color: 'var(--amber)', fontSize: '0.65rem', marginLeft: '0.5rem' }}>
                  {mitre}
                </span>
              </div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{c.count}</span>
            </div>
            <div style={{ background: 'var(--border)', height: '6px', borderRadius: '2px' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ background: color, height: '100%', borderRadius: '2px' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}