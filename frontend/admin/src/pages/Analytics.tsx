import { useEffect, useState } from 'react'
import { admin } from '../api/client'
import styles from './Analytics.module.css'

export default function Analytics() {
  const [period, setPeriod] = useState('7d')
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [chartKey, setChartKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    admin
      .analytics(period)
      .then((res) => {
        console.log('[Analytics] API Response:', res)
        setData(res.analytics)
        // Force chart re-render for animation
        setChartKey(prev => prev + 1)
      })
      .catch((err) => {
        console.error('[Analytics] Error:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [period])

  if (loading && !data) return <div className={styles.loading}>Loading analytics…</div>
  if (error && !data) return <div className={styles.error}>Error: {error}</div>

  const metrics = data?.metrics || {}
  const trends = data?.trends || {}
  const byDay = trends.incidentsByDay || []
  const bySeverity = trends.bySeverity || []
  const byCategory = trends.byCategory || []
  const byHour = trends.byHour || []

  const hasData = metrics.totalIncidents > 0 || metrics.incidentsInPeriod > 0

  if (!hasData && !loading) {
    return (
      <div>
        <div className={styles.header}>
          <div>
            <h1>Analytics Dashboard</h1>
            <p className={styles.muted}>Comprehensive insights and trends</p>
          </div>
          <div className={styles.period}>
            <label>
              Period
              <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </label>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <h2>No Data Available</h2>
          <p>There are no incidents in the database yet.</p>
          <p className={styles.emptyHint}>
            To see analytics:
            <br />
            1. Submit incidents through the mobile app
            <br />
            2. Or add test data through the moderation queue
          </p>
        </div>
      </div>
    )
  }

  const maxDayCount = Math.max(...byDay.map((d: any) => d.count), 1)
  const maxSeverityCount = Math.max(...bySeverity.map((s: any) => s.count), 1)
  const maxCategoryCount = Math.max(...byCategory.map((c: any) => c.count), 1)
  const maxHourCount = Math.max(...byHour.map((h: any) => h.count), 1)

  // Debug logging
  console.log('[Analytics] Chart data:', {
    maxDayCount,
    maxSeverityCount,
    maxHourCount,
    byDay: byDay.filter((d: any) => d.count > 0),
    bySeverity: bySeverity.filter((s: any) => s.count > 0),
    byHour: byHour.filter((h: any) => h.count > 0),
  })

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1>Analytics Dashboard</h1>
          <p className={styles.muted}>Comprehensive insights and trends</p>
        </div>
        <div className={styles.period}>
          <label>
            Period
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </label>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{metrics.totalIncidents ?? 0}</div>
          <div className={styles.metricLabel}>Total Incidents</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{metrics.incidentsInPeriod ?? 0}</div>
          <div className={styles.metricLabel}>In Period</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{metrics.panicAlerts ?? 0}</div>
          <div className={styles.metricLabel}>Panic Alerts</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{metrics.communityReports ?? 0}</div>
          <div className={styles.metricLabel}>Community Reports</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{metrics.verified ?? 0}</div>
          <div className={styles.metricLabel}>Verified</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{metrics.verificationRate?.toFixed(1) ?? 0}%</div>
          <div className={styles.metricLabel}>Verification Rate</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Incidents by Day - Line Chart */}
        {byDay.length > 0 && (
          <div className={styles.chartCard}>
            <h2>Incidents by Day</h2>
            <div className={styles.chartContainer}>
              <div className={styles.barChart} key={`day-${chartKey}`}>
                {byDay.map((d: any, idx: number) => {
                  if (d.count === 0) {
                    const date = new Date(d.date)
                    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    return (
                      <div key={d.date} className={styles.barGroup}>
                        <div className={styles.barWrapper}></div>
                        <div className={styles.barLabel}>{label}</div>
                        <div className={styles.barValue}>{d.count}</div>
                      </div>
                    )
                  }
                  const chartHeight = 180 // Match barWrapper height
                  const heightPx = maxDayCount > 0 
                    ? Math.max((d.count / maxDayCount) * chartHeight, d.count > 0 ? 8 : 0)
                    : 0
                  const date = new Date(d.date)
                  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  return (
                    <div key={d.date} className={styles.barGroup}>
                      <div className={styles.barWrapper}>
                        <div
                          className={styles.bar}
                          style={{ 
                            height: `${heightPx}px`,
                          }}
                          title={`${d.count} incidents`}
                        />
                      </div>
                      <div className={styles.barLabel}>{label}</div>
                      <div className={styles.barValue}>{d.count}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* By Severity - Bar Chart */}
        {bySeverity.length > 0 && (
          <div className={styles.chartCard}>
            <h2>By Severity Level</h2>
            <div className={styles.chartContainer}>
              <div className={styles.barChart} key={`severity-${chartKey}`}>
                {bySeverity.map((s: any) => {
                  if (s.count === 0) {
                    return (
                      <div key={s.severity} className={styles.barGroup}>
                        <div className={styles.barWrapper}></div>
                        <div className={styles.barLabel}>Level {s.severity}</div>
                        <div className={styles.barValue}>{s.count}</div>
                      </div>
                    )
                  }
                  const chartHeight = 180 // Match barWrapper height
                  const heightPx = maxSeverityCount > 0 
                    ? Math.max((s.count / maxSeverityCount) * chartHeight, s.count > 0 ? 8 : 0)
                    : 0
                  const severityColors: Record<number, string> = {
                    1: '#3fb950',
                    2: '#d29922',
                    3: '#f85149',
                    4: '#f85149',
                    5: '#da3633',
                  }
                  return (
                    <div key={s.severity} className={styles.barGroup}>
                      <div className={styles.barWrapper}>
                        <div
                          className={styles.bar}
                          style={{
                            height: `${heightPx}px`,
                            backgroundColor: severityColors[s.severity] || '#8b949e',
                          }}
                          title={`Severity ${s.severity}: ${s.count} incidents`}
                        />
                      </div>
                      <div className={styles.barLabel}>Level {s.severity}</div>
                      <div className={styles.barValue}>{s.count}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* By Category */}
        {byCategory.length > 0 && (
          <div className={styles.chartCard}>
            <h2>By Category</h2>
            <div className={styles.chartContainer}>
              <div className={styles.categoryList}>
                {byCategory.slice(0, 10).map((c: any) => {
                  if (c.count === 0) return null
                  const width = maxCategoryCount > 0 
                    ? Math.max((c.count / maxCategoryCount) * 100, 2) // Minimum 2% width
                    : 0
                  return (
                    <div key={c.category} className={styles.categoryItem}>
                      <div className={styles.categoryName}>{c.category || 'Uncategorized'}</div>
                      <div className={styles.categoryBarContainer}>
                        <div
                          className={styles.categoryBar}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <div className={styles.categoryCount}>{c.count}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* By Hour of Day */}
        {byHour.length > 0 && (
          <div className={styles.chartCard}>
            <h2>By Hour of Day (Local Time)</h2>
            <div className={styles.chartContainer}>
              <div className={styles.barChart} key={`hour-${chartKey}`}>
                {byHour.map((h: any) => {
                  if (h.count === 0) {
                    return (
                      <div key={h.hour} className={styles.barGroup}>
                        <div className={styles.barWrapper}></div>
                        <div className={styles.barLabel}>{h.hour}h</div>
                        <div className={styles.barValue}>{h.count}</div>
                      </div>
                    )
                  }
                  const chartHeight = 180 // Match barWrapper height
                  const heightPx = maxHourCount > 0 
                    ? Math.max((h.count / maxHourCount) * chartHeight, h.count > 0 ? 8 : 0)
                    : 0
                  const isNight = h.hour >= 21 || h.hour < 6
                  const isEvening = h.hour >= 18 && h.hour < 21
                  const color = isNight ? '#f85149' : isEvening ? '#d29922' : '#3fb950'
                  return (
                    <div key={h.hour} className={styles.barGroup}>
                      <div className={styles.barWrapper}>
                        <div
                          className={styles.bar}
                          style={{ 
                            height: `${heightPx}px`, 
                            backgroundColor: color 
                          }}
                          title={`${h.hour}:00 - ${h.count} incidents`}
                        />
                      </div>
                      <div className={styles.barLabel}>{h.hour}h</div>
                      <div className={styles.barValue}>{h.count}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Tables */}
      <div className={styles.tablesGrid}>
        {byDay.length > 0 && (
          <div className={styles.tableCard}>
            <h3>Daily Breakdown</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {byDay.map((d: any) => (
                    <tr key={d.date}>
                      <td>{new Date(d.date).toLocaleDateString()}</td>
                      <td>{d.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {byCategory.length > 0 && (
          <div className={styles.tableCard}>
            <h3>Top Categories</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {byCategory.slice(0, 10).map((c: any) => (
                    <tr key={c.category}>
                      <td>{c.category || 'Uncategorized'}</td>
                      <td>{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
