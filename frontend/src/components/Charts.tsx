import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Stats } from '../api'

const COLORS = ['var(--accent)', 'var(--amber)', 'var(--red)', '#4488ff', '#aa44ff']

const chartStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  padding: '1.5rem',
}

const labelStyle = {
  color: 'var(--text-dim)',
  fontSize: '0.7rem',
  letterSpacing: '0.15em',
  marginBottom: '1rem',
}

const tooltipStyle = {
  contentStyle: { background: 'var(--surface)', border: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '0.75rem' },
  labelStyle: { color: 'var(--accent)' },
}

export function TopPasswordsChart({ data }: { data: Stats['top_passwords'] }) {
  return (
    <div style={chartStyle}>
      <div style={labelStyle}>TOP PASSWORDS</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
          <YAxis type="category" dataKey="password" tick={{ fill: 'var(--text)', fontSize: 10 }} width={80} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="count" radius={[0, 2, 2, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TopCommandsChart({ data }: { data: Stats['top_commands'] }) {
  return (
    <div style={chartStyle}>
      <div style={labelStyle}>TOP COMMANDS</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
          <YAxis type="category" dataKey="command" tick={{ fill: 'var(--text)', fontSize: 10 }} width={80} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="count" radius={[0, 2, 2, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}