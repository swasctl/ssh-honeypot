import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchClassification, fetchEnrichment } from '../api'
import type { Session, Classification, Enrichment } from '../api'

const severityBadge = (severity: string) => {
  const colors: Record<string, string> = {
    high: 'var(--red)',
    medium: 'var(--amber)',
    low: 'var(--accent)',
  }
  return (
    <span style={{
      background: colors[severity] + '22',
      color: colors[severity],
      border: `1px solid ${colors[severity]}`,
      padding: '0.15rem 0.5rem',
      fontSize: '0.65rem',
      letterSpacing: '0.1em',
      fontWeight: 600,
    }}>
      {severity.toUpperCase()}
    </span>
  )
}

const abuseColor = (score: number | null) => {
  if (score === null) return 'var(--text-dim)'
  if (score >= 80) return 'var(--red)'
  if (score >= 40) return 'var(--amber)'
  return 'var(--accent)'
}

interface Props {
  session: Session
  onClick: () => void
}

export default function SessionRow({ session, onClick }: Props) {
  const [cl, setCl] = useState<Classification | null>(null)
  const [en, setEn] = useState<Enrichment | null>(null)

  useEffect(() => {
    fetchClassification(session.id).then(data => {
      if (data && data.classification) setCl(data)
    }).catch(() => {})
    fetchEnrichment(session.id).then(data => {
      if (data && data.country) setEn(data)
    }).catch(() => {})
  }, [session.id])

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: '#0d1117cc' }}
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 0.8fr 1.2fr 0.6fr 0.6fr',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        fontSize: '0.78rem',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <div>
        <div style={{ color: 'var(--accent)' }}>{session.ip}</div>
        <div style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>
          {en ? `${en.city}, ${en.country_code}` : '—'}
        </div>
      </div>

      <span style={{ color: 'var(--text-dim)' }}>
        {session.username}<span style={{ color: '#333' }}>:</span>
        <span style={{ color: 'var(--text)' }}>{session.password}</span>
      </span>

      <div>
        {cl ? severityBadge(cl.severity) : <span style={{ color: 'var(--text-dim)' }}>—</span>}
      </div>

      <div>
        <div style={{ color: 'var(--text)', fontSize: '0.75rem' }}>
          {cl?.classification?.replace(/_/g, ' ') ?? '—'}
        </div>
        <div style={{ color: 'var(--amber)', fontSize: '0.65rem' }}>
          {cl?.mitre_id ?? ''}
        </div>
      </div>

      <div style={{ color: abuseColor(en?.abuse_score ?? null), fontSize: '0.75rem', fontWeight: 600 }}>
        {en?.abuse_score !== null && en?.abuse_score !== undefined ? `${en.abuse_score}%` : '—'}
      </div>

      <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>
        {new Date(session.timestamp).toLocaleTimeString()}
      </span>
    </motion.div>
  )
}