import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchStats, fetchSessions, fetchEnrichment, fetchClassification, fetchConnections } from './api'
import type { Stats, Session, Connection } from './api'
import ThreatMap from './components/ThreatMap'
import ThreatFeed from './components/ThreatFeed'
import SessionDrawer from './components/SessionDrawer'
import ConnectionsTable from './components/ConnectionsTable'
import MitreChart from './components/MitreChart'
import CredentialIntel from './components/CredentialIntel'
import CampaignPanel from './components/CampaignPanel'

interface DotData {
  lat: number
  lng: number
  severity: string
  ip: string
  abuse_score: number | null
  country_code: string
  city: string
}

export default function App() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [dots, setDots] = useState<DotData[]>([])
  const [selected, setSelected] = useState<Session | null>(null)

  useEffect(() => {
    fetchStats().then(setStats)
    fetchConnections().then(setConnections)
    fetchSessions().then(async sessions => {
      setSessions(sessions)
      const dotData: DotData[] = []
      for (const s of sessions) {
        try {
          const [en] = await Promise.all([
              fetchEnrichment(s.id),
              fetchClassification(s.id),
            ])

          if (en?.latitude && en?.longitude) {
            dotData.push({
              lat: en.latitude,
              lng: en.longitude,
              severity: en.abuse_score != null && en.abuse_score >= 80 ? 'high'
                : en.abuse_score != null && en.abuse_score >= 40 ? 'medium'
                : 'low',
              ip: s.ip,
              abuse_score: en.abuse_score,
              country_code: en.country_code ?? '—',
              city: en.city ?? '—',
            })
          }
        } catch {}
      }
      setDots(dotData)
    })
    const interval = setInterval(() => {
      fetchStats().then(setStats)
      fetchConnections().then(setConnections)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleSelect = (id: number) => {
    const s = sessions.find(s => s.id === id)
    if (s) setSelected(s)
  }

  const kpis = [
    {
      label: 'TOTAL CONNECTIONS',
      value: stats?.total_connections ?? 0,
      sub: 'incl. failed scans',
      color: 'var(--accent)',
    },
    {
      label: 'AUTH SUCCESS RATE',
      value: stats ? `${stats.auth_success_rate}%` : '—',
      sub: `${stats?.total_sessions ?? 0} sessions captured`,
      color: stats && (stats.auth_success_rate ?? 0) > 50 ? 'var(--red)' : 'var(--amber)',
    },
    {
      label: 'PEAK ABUSE SCORE',
      value: stats?.peak_abuse ?? 0,
      sub: stats?.peak_abuse_ip ?? '—',
      color: stats && (stats.peak_abuse ?? 0) >= 80 ? 'var(--red)' : 'var(--amber)',
    },
    {
      label: 'COUNTRIES SEEN',
      value: stats?.country_count ?? 0,
      sub: stats?.countries?.join(' · ') || 'no geo data yet',
      color: 'var(--accent)',
    },
    {
      label: 'BOT RATIO',
      value: stats ? `${stats.bot_pct}%` : '—',
      sub: 'automated vs manual',
      color: stats && (stats.bot_pct ?? 0) > 50 ? 'var(--red)' : 'var(--amber)',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'var(--mono)' }}>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.8rem', color: 'var(--accent)', letterSpacing: '0.05em' }}>
            SSH HONEYPOT
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.65rem', letterSpacing: '0.2em' }}>
            THREAT INTELLIGENCE DASHBOARD
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.7rem' }}>
          <div style={{ color: 'var(--accent)', marginBottom: '0.25rem' }}>● ACTIVE</div>
          <div style={{ color: 'var(--text-dim)' }}>{new Date().toLocaleString()}</div>
        </div>
      </motion.div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderTop: `2px solid ${k.color}`,
              padding: '0.85rem 1rem',
            }}
          >
            <div style={{ color: 'var(--text-dim)', fontSize: '0.58rem', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
              {k.label}
            </div>
            <div style={{ color: k.color, fontSize: '1.5rem', fontFamily: 'var(--display)', fontWeight: 700, lineHeight: 1, marginBottom: '0.3rem' }}>
              {k.value}
            </div>
            {k.sub && (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.58rem' }}>
                {k.sub}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Map */}
      <div style={{ marginBottom: '1rem' }}>
        <ThreatMap dots={dots} />
      </div>

      {/* Campaign panel — most important intel */}
      <div style={{ marginBottom: '1rem' }}>
        <CampaignPanel />
      </div>

      {/* Live feed */}
      <div style={{ marginBottom: '1rem' }}>
        <ThreatFeed onSelect={handleSelect} historical={sessions} />
      </div>

      {/* MITRE + Credential Intel */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <MitreChart classifications={stats.classifications} />
          <CredentialIntel credentials={stats.credential_intel} />
        </div>
      )}

      {/* All connections */}
      <div style={{ marginBottom: '1.5rem' }}>
        <ConnectionsTable connections={connections} />
      </div>

      <SessionDrawer session={selected} onClose={() => setSelected(null)} />
    </div>
  )
}