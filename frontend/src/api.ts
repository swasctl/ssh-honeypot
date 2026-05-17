const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
export interface Session {
  id: number
  ip: string
  port: number
  username: string
  password: string
  timestamp: string
  duration: number
  client_version: string
}

export interface Command {
  command: string
  timestamp: string
}

export interface Classification {
  classification: string
  severity: string
  mitre_id: string
  mitre_name: string
  description: string
}

export interface Stats {
  total_sessions: number
  total_commands: number
  total_connections: number
  top_passwords: { password: string; count: number }[]
  top_ips: { ip: string; count: number }[]
  top_commands: { command: string; count: number }[]
  classifications: { classification: string; severity: string; count: number }[]
  avg_duration: number
  new_ips_last_hour: number
  bot_pct: number
  human_pct: number
  auth_success_rate: number
  peak_abuse: number
  peak_abuse_ip: string
  countries: string[]
  country_count: number
  top_country: string
  credential_intel: { password: string; count: number; type: string }[]
}

export interface Enrichment {
  country: string
  country_code: string
  city: string
  latitude: number | null
  longitude: number | null
  abuse_score: number | null
  total_reports: number | null
  last_reported: string | null
}

export interface Connection {
  id: number
  ip: string
  port: number
  timestamp: string
  client_version: string
  result: string
  failure_reason: string
  country_code: string
  abuse_score: number | null
}



export const fetchStats = (): Promise<Stats> =>
  fetch(`${BASE}/stats/`).then(r => r.json())

export const fetchSessions = (): Promise<Session[]> =>
  fetch(`${BASE}/sessions/`).then(r => r.json())

export const fetchCommands = (id: number): Promise<Command[]> =>
  fetch(`${BASE}/sessions/${id}/commands`).then(r => r.json())

export const fetchClassification = (id: number): Promise<Classification> =>
  fetch(`${BASE}/sessions/${id}/classification`).then(r => r.json())

export const fetchEnrichment = (id: number): Promise<Enrichment> =>
  fetch(`${BASE}/sessions/${id}/enrichment`).then(r => r.json())

export const fetchConnections = (): Promise<Connection[]> =>
  fetch(`${BASE}/sessions/connections`).then(r => r.json())