import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchClassification, fetchEnrichment } from '../api'
import type { Classification, Enrichment, Session } from '../api'

interface LiveSession {
  id: number
  ip: string
  username: string
  password: string
  timestamp: string
  client_version: string
}

const mitreIds: Record<string, string> = {
  automated_bot: 'T1110.001',
  credential_stuffing: 'T1110.004',
  manual_attacker: 'T1059',
  reconnaissance: 'T1082',
  unknown: 'T1078',
}

const intentLabel: Record<string, string> = {
  automated_bot: 'Password spray',
  credential_stuffing: 'Cred stuffing',
  manual_attacker: 'Manual recon',
  reconnaissance: 'Recon',
  unknown: 'Unknown',
}

const severityColor: Record<string, string> = {
  high: 'var(--red)',
  medium: 'var(--amber)',
  low: 'var(--accent)',
}

function FeedRow({ m, onSelect }: { m: LiveSession; onSelect: (id: number) => void }) {
  const [cl, setCl] = useState<Classification | null>(null)
  const [en, setEn] = useState<Enrichment | null>(null)

  useEffect(() => {
    fetchClassification(m.id).then(d => { if (d?.classification) setCl(d) }).catch(() => {})
    fetchEnrichment(m.id).then(d => { if (d?.country) setEn(d) }).catch(() => {})
  }, [m.id])

  const color = severityColor[cl?.severity ?? 'low']
  const mitre = cl ? mitreIds[cl.classification] ?? '—' : '—'
  const intent = cl ? intentLabel[cl.classification] ?? '—' : '—'
  const abuseColor = en?.abuse_score != null
    ? en.abuse_score >= 80 ? 'var(--red)' : en.abuse_score >= 40 ? 'var(--amber)' : 'var(--accent)'
    : 'var(--text-dim)'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => onSelect(m.id)}
      style={{
        display: 'grid',
        gridTemplateColumns: '0.6fr 1fr 1fr 0.8fr 1.2fr 0.4fr 0.5fr',
        padding: '0.45rem 1rem',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        fontSize: '0.72rem',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>
        {new Date(m.timestamp).toLocaleTimeString()}
      </span>
      <div>
        <div style={{ color }}>{m.ip}</div>
        <div style={{ color: 'var(--text-dim)', fontSize: '0.62rem' }}>
          {en ? `${en.country_code} · ${en.city}` : '—'}
        </div>
      </div>
      <span>
        <span style={{ color: 'var(--text-dim)' }}>{m.username}:</span>
        <span style={{ color: 'var(--amber)' }}>{m.password}</span>
      </span>
      <span style={{ color: 'var(--text-dim)', fontSize: '0.62rem' }}>
        {m.client_version?.replace('SSH-2.0-', '') ?? '—'}
      </span>
      <div>
        <div style={{ color, fontSize: '0.7rem' }}>{intent}</div>
        <div style={{ color: 'var(--amber)', fontSize: '0.62rem' }}>{mitre}</div>
      </div>
      <span style={{ color: abuseColor, fontWeight: 600, fontSize: '0.7rem' }}>
        {en?.abuse_score ?? '—'}
      </span>
      <span style={{
        background: color + '22',
        color,
        border: `1px solid ${color}`,
        padding: '0.1rem 0.3rem',
        fontSize: '0.58rem',
        letterSpacing: '0.05em',
        textAlign: 'center',
      }}>
        AUTH
      </span>
    </motion.div>
  )
}

export default function ThreatFeed({
  onSelect,
  historical,
}: {
  onSelect: (id: number) => void
  historical: Session[]
}) {
  const [messages, setMessages] = useState<LiveSession[]>([])

  useEffect(() => {
    setMessages(historical.map(s => ({
      id: s.id,
      ip: s.ip,
      username: s.username,
      password: s.password,
      timestamp: s.timestamp,
      client_version: s.client_version,
    })))
  }, [historical.length])

    useEffect(() => {
    const wsBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace('http', 'ws')
    const ws = new WebSocket(`${wsBase}/ws/live`)
    ws.onmessage = (e) => {
        const data = JSON.parse(e.data) as LiveSession
        setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev
        return [data, ...prev].slice(0, 100)
        })
    }
    return () => ws.close()
    }, [])

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderTop: '2px solid var(--red)',
      fontFamily: 'var(--mono)',
    }}>
      <div style={{
        padding: '0.5rem 1rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'var(--surface)',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
        <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem', letterSpacing: '0.15em' }}>
          LIVE THREAT FEED — {messages.length} sessions
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '0.6fr 1fr 1fr 0.8fr 1.2fr 0.4fr 0.5fr',
        padding: '0.35rem 1rem',
        borderBottom: '1px solid var(--border)',
        fontSize: '0.58rem',
        color: 'var(--text-dim)',
        letterSpacing: '0.1em',
        gap: '0.5rem',
      }}>
        <span>TIME</span>
        <span>IP · GEO</span>
        <span>CREDENTIAL</span>
        <span>CLIENT</span>
        <span>INTENT · MITRE</span>
        <span>ABUSE</span>
        <span>RESULT</span>
      </div>

      {messages.length === 0 && (
        <div style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
          Awaiting connections...
        </div>
      )}
      {messages.map(m => (
        <FeedRow key={`${m.id}-${m.timestamp}`} m={m} onSelect={onSelect} />
      ))}
    </div>
  )
}