import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Campaign {
  ip: string
  country_code: string
  abuse_score: number | null
  first_seen: string
  last_seen: string
  attempt_count: number
  passwords: string[]
  classification: string
  mitre_id: string
}

const classColor: Record<string, string> = {
  automated_bot: 'var(--red)',
  credential_stuffing: 'var(--amber)',
  manual_attacker: 'var(--red)',
  reconnaissance: 'var(--amber)',
}

export default function CampaignPanel() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    fetch('http://localhost:8000/sessions/campaigns')
      .then(r => r.json())
      .then(data => setCampaigns(data.filter((c: Campaign) => c.country_code !== 'XX')))
  }, [])

  const exportIOCs = () => {
    window.open('http://localhost:8000/sessions/iocs/export', '_blank')
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderTop: '2px solid var(--red)',
      fontFamily: 'var(--mono)',
      marginBottom: '1rem',
    }}>
      <div style={{
        padding: '0.6rem 1rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
          <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem', letterSpacing: '0.15em' }}>
            ACTIVE CAMPAIGNS — {campaigns.length} threat actors
          </span>
        </div>
        <button
          onClick={exportIOCs}
          style={{
            background: 'none',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            padding: '0.25rem 0.75rem',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            fontFamily: 'var(--mono)',
          }}
        >
          ↓ EXPORT IOCs
        </button>
      </div>

      {campaigns.map((c, i) => (
        <motion.div
          key={c.ip}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 0.4fr 0.4fr 0.6fr 0.6fr 2fr',
            padding: '0.6rem 1rem',
            borderBottom: '1px solid var(--border)',
            fontSize: '0.72rem',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ color: classColor[c.classification] ?? 'var(--red)', fontWeight: 600 }}>{c.ip}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.62rem' }}>{c.country_code} · abuse {c.abuse_score ?? 0}</div>
          </div>

          <div style={{
            background: 'var(--red)',
            color: '#fff',
            padding: '0.1rem 0.4rem',
            fontSize: '0.58rem',
            letterSpacing: '0.08em',
            textAlign: 'center',
            alignSelf: 'flex-start',
          }}>
            CAMPAIGN
          </div>

          <div style={{ color: 'var(--amber)', fontSize: '0.65rem' }}>{c.mitre_id}</div>

          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.58rem' }}>ATTEMPTS</div>
            <div style={{ color: 'var(--red)', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--display)' }}>
              {c.attempt_count}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.58rem' }}>DURATION</div>
            <div style={{ color: 'var(--text)', fontSize: '0.65rem' }}>
              {Math.round((new Date(c.last_seen).getTime() - new Date(c.first_seen).getTime()) / 60000)}m
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.58rem', marginBottom: '0.2rem' }}>CREDENTIALS TRIED</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
              {c.passwords.slice(0, 8).map((p, j) => (
                <span key={j} style={{
                  background: 'var(--border)',
                  color: 'var(--amber)',
                  padding: '0.1rem 0.3rem',
                  fontSize: '0.58rem',
                  borderRadius: '2px',
                }}>
                  {p}
                </span>
              ))}
              {c.passwords.length > 8 && (
                <span style={{ color: 'var(--text-dim)', fontSize: '0.58rem', alignSelf: 'center' }}>
                  +{c.passwords.length - 8} more
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}