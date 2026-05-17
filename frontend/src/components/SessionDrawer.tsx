import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchCommands, fetchClassification } from '../api'
import type { Command, Classification, Session } from '../api'

const severityColor: Record<string, string> = {
  high: 'var(--red)',
  medium: 'var(--amber)',
  low: 'var(--accent)',
}

interface Props {
  session: Session | null
  onClose: () => void
}

export default function SessionDrawer({ session, onClose }: Props) {
  const [commands, setCommands] = useState<Command[]>([])
  const [classification, setClassification] = useState<Classification | null>(null)

  useEffect(() => {
    if (!session) return
    fetchCommands(session.id).then(setCommands)
    fetchClassification(session.id).then(setClassification)
  }, [session])

  return (
    <AnimatePresence>
      {session && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 40,
            }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            style={{
              position: 'fixed', right: 0, top: 0, bottom: 0,
              width: '480px',
              background: 'var(--surface)',
              borderLeft: '1px solid var(--border)',
              zIndex: 50,
              overflowY: 'auto',
              fontFamily: 'var(--mono)',
            }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.1rem' }}>
                SESSION #{session.id}
              </span>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <Row label="IP" value={session.ip} />
              <Row label="CREDENTIALS" value={`${session.username} / ${session.password}`} />
              <Row label="CLIENT" value={session.client_version} />
              <Row label="DURATION" value={`${session.duration?.toFixed(2)}s`} />
            </div>

            {classification && (
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: '1rem' }}>CLASSIFICATION</div>
                <div style={{ color: severityColor[classification.severity], fontFamily: 'var(--display)', fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                  {classification.classification.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div style={{ color: 'var(--amber)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  {classification.mitre_id} — {classification.mitre_name}
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{classification.description}</div>
              </div>
            )}

            <div style={{ padding: '1.5rem' }}>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: '1rem' }}>
                COMMANDS ({commands.length})
              </div>
              {commands.length === 0 && (
                <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>No commands recorded</div>
              )}
              {commands.map((c, i) => (
                <div key={i} style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--accent)' }}>$ </span>
                  <span style={{ color: 'var(--text)' }}>{c.command}</span>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.65rem', marginTop: '0.1rem' }}>
                    {new Date(c.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ color: 'var(--text-dim)', fontSize: '0.65rem', letterSpacing: '0.15em' }}>{label}</div>
      <div style={{ color: 'var(--text)', fontSize: '0.8rem', wordBreak: 'break-all' }}>{value}</div>
    </div>
  )
}