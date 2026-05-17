import { motion } from 'framer-motion'

interface Props {
  label: string
  value: number | string
  accent?: 'green' | 'amber' | 'red'
}

const colors = {
  green: 'var(--accent)',
  amber: 'var(--amber)',
  red: 'var(--red)',
}

export default function StatCard({ label, value, accent = 'green' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--surface)',
        border: `1px solid var(--border)`,
        borderTop: `2px solid ${colors[accent]}`,
        padding: '1.5rem',
        fontFamily: 'var(--mono)',
      }}
    >
      <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ color: colors[accent], fontSize: '2.5rem', fontFamily: 'var(--display)', fontWeight: 700, lineHeight: 1 }}>
        {value}
      </div>
    </motion.div>
  )
}