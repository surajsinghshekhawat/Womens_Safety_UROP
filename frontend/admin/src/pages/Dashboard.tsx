import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { admin } from '../api/client'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    admin
      .dashboard()
      .then((res) => setData(res.dashboard))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.loading}>Loading dashboard…</div>
  if (error) return <div className={styles.error}>Error: {error}</div>
  if (!data) return null

  const { overview, recentIncidents, mlServiceHealthy } = data

  return (
    <div>
      <h1>Dashboard</h1>
      <p className={styles.muted}>Overview of incidents and system status</p>

      <div className={styles.status}>
        ML Service: <span className={mlServiceHealthy ? styles.ok : styles.bad}>
          {mlServiceHealthy ? 'Healthy' : 'Unavailable'}
        </span>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardValue}>{overview?.totalIncidents ?? 0}</span>
          <span className={styles.cardLabel}>Total incidents</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{overview?.incidentsToday ?? 0}</span>
          <span className={styles.cardLabel}>Today</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{overview?.panicAlerts ?? 0}</span>
          <span className={styles.cardLabel}>Panic alerts</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardValue}>{overview?.pendingVerification ?? 0}</span>
          <span className={styles.cardLabel}>Pending verification</span>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Recent incidents</h2>
          <Link to="/admin/incidents">View all</Link>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Location</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(recentIncidents || []).slice(0, 10).map((i: any) => (
                <tr key={i.id}>
                  <td><code>{i.id.slice(0, 12)}…</code></td>
                  <td>{i.type}</td>
                  <td>{i.location?.lat?.toFixed(4)}, {i.location?.lng?.toFixed(4)}</td>
                  <td>{new Date(i.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={i.verified ? styles.badgeOk : styles.badgePending}>
                      {i.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!recentIncidents || recentIncidents.length === 0) && (
            <p className={styles.empty}>No recent incidents</p>
          )}
        </div>
      </section>
    </div>
  )
}
