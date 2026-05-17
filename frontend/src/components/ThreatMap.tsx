import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface AttackDot {
  lat: number
  lng: number
  severity: string
  ip: string
  abuse_score: number | null
  country_code?: string
  city?: string
}

const severityColor: Record<string, string> = {
  high: '#ff3355',
  medium: '#ffaa00',
  low: '#00ff88',
}

function MapStyle() {
  const map = useMap()
  useEffect(() => {
    map.getContainer().style.background = '#080d1a'
  }, [map])
  return null
}

export default function ThreatMap({ dots }: { dots: AttackDot[] }) {
  const uniqueDots = Object.values(
    dots.reduce((acc, dot) => {
      if (!acc[dot.ip] || (dot.abuse_score ?? 0) > (acc[dot.ip].abuse_score ?? 0)) {
        acc[dot.ip] = dot
      }
      return acc
    }, {} as Record<string, AttackDot>)
  )

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderTop: '2px solid var(--accent)',
    }}>
      <div style={{
        background: '#050810',
        padding: '0.5rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.15em' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          ATTACK ORIGINS — {uniqueDots.length} unique IPs · scroll to zoom · click markers for details
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {Object.entries(severityColor).map(([s, c]) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block' }} />
              {s}
            </div>
          ))}
        </div>
      </div>

      <MapContainer
        center={[20, 20]}
        zoom={2}
        minZoom={2}
        maxZoom={10}
        style={{ height: '420px', width: '100%', background: '#080d1a' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapStyle />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {uniqueDots.map(dot => {
          const color = severityColor[dot.severity] ?? '#00ff88'
          const r = dot.abuse_score != null ? Math.max(8, (dot.abuse_score / 100) * 20) : 10

          return (
            <CircleMarker
              key={dot.ip}
              center={[dot.lat, dot.lng]}
              radius={r}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.85,
                weight: 1.5,
              }}
            >
              <Popup>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  background: '#0d1117',
                  color: '#c9d1d9',
                  padding: '4px',
                  minWidth: '180px',
                }}>
                  <div style={{ color, fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                    {dot.ip}
                  </div>
                  <div style={{ marginBottom: '3px' }}>
                    <span style={{ color: '#4a5568' }}>Country: </span>
                    {dot.country_code ?? '—'} · {dot.city && dot.city !== 'Unknown' ? dot.city : '—'}
                  </div>
                  <div style={{ marginBottom: '3px' }}>
                    <span style={{ color: '#4a5568' }}>Abuse score: </span>
                    <span style={{ color: (dot.abuse_score ?? 0) >= 80 ? '#ff3355' : '#00ff88', fontWeight: 700 }}>
                      {dot.abuse_score ?? 0}/100
                    </span>
                  </div>
                  <div style={{ marginBottom: '3px' }}>
                    <span style={{ color: '#4a5568' }}>Severity: </span>
                    <span style={{ color, textTransform: 'uppercase' }}>{dot.severity}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}