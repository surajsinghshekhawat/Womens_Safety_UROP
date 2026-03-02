import { useState } from 'react'
import { admin } from '../api/client'
import styles from './Heatmap.module.css'

const DEFAULT_LAT = 13.0827
const DEFAULT_LNG = 80.2707

export default function Heatmap() {
  const [lat, setLat] = useState(String(DEFAULT_LAT))
  const [lng, setLng] = useState(String(DEFAULT_LNG))
  const [radius, setRadius] = useState(3000)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setError('')
    setLoading(true)
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    if (isNaN(latNum) || isNaN(lngNum)) {
      setError('Invalid lat/lng')
      setLoading(false)
      return
    }
    admin
      .heatmap(latNum, lngNum, radius, 100)
      .then((res) => setData(res.heatmap))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  const heatmap = data
  const cells = heatmap?.cells || []
  const clusters = heatmap?.clusters || []
  const mapUrl = data
    ? `https://www.google.com/maps?q=${lat},${lng}&z=14`
    : null

  return (
    <div>
      <h1>Admin heatmap</h1>
      <p className={styles.muted}>Heatmap with unsafe-zone clusters (admin-only)</p>

      <div className={styles.controls}>
        <label>
          Lat
          <input
            type="text"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="13.0827"
          />
        </label>
        <label>
          Lng
          <input
            type="text"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="80.2707"
          />
        </label>
        <label>
          Radius (m)
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value) || 3000)}
            min={500}
            max={20000}
            step={500}
          />
        </label>
        <button type="button" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Load heatmap'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {data && (
        <>
          <div className={styles.summary}>
            <span>{cells.length} cells</span>
            <span>{clusters.length} clusters (unsafe zones)</span>
            {mapUrl && (
              <a href={mapUrl} target="_blank" rel="noreferrer">
                Open in Google Maps
              </a>
            )}
          </div>

          {clusters.length > 0 && (
            <section className={styles.section}>
              <h2>Unsafe zones (DBSCAN clusters)</h2>
              <div className={styles.clusterList}>
                {clusters.map((c: any, idx: number) => (
                  <div key={c.id || idx} className={styles.cluster}>
                    <div className={styles.clusterHead}>
                      <strong>Cluster {idx + 1}</strong>
                      <span>Risk: {Number(c.risk_score).toFixed(2)}</span>
                      <span>{c.incident_count ?? 0} incidents</span>
                    </div>
                    <div className={styles.clusterMeta}>
                      Center: {Number(c.center?.lat).toFixed(4)}, {Number(c.center?.lng).toFixed(4)}
                      {' · '}Radius: {Number(c.radius).toFixed(0)} m
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${c.center?.lat},${c.center?.lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on map
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {cells.length > 0 && (
            <section className={styles.section}>
              <h2>High-risk cells (top 20)</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Lat</th>
                      <th>Lng</th>
                      <th>Risk</th>
                      <th>Level</th>
                      <th>Incidents</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...cells]
                      .sort((a: any, b: any) => (b.risk_score || 0) - (a.risk_score || 0))
                      .slice(0, 20)
                      .map((c: any, idx: number) => (
                        <tr key={idx}>
                          <td>{Number(c.lat).toFixed(4)}</td>
                          <td>{Number(c.lng).toFixed(4)}</td>
                          <td>{Number(c.risk_score).toFixed(2)}</td>
                          <td>{c.risk_level}</td>
                          <td>{c.incident_count ?? 0}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
