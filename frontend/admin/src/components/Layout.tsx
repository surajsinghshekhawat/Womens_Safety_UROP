import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Women Safety Analytics</div>
        <nav className={styles.nav}>
          <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? styles.active : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/incidents" className={({ isActive }) => (isActive ? styles.active : '')}>
            Moderation
          </NavLink>
          <NavLink to="/admin/heatmap" className={({ isActive }) => (isActive ? styles.active : '')}>
            Heatmap
          </NavLink>
          <NavLink to="/admin/analytics" className={({ isActive }) => (isActive ? styles.active : '')}>
            Analytics
          </NavLink>
          <NavLink to="/admin/audit" className={({ isActive }) => (isActive ? styles.active : '')}>
            Audit
          </NavLink>
        </nav>
        <button type="button" className={styles.logout} onClick={handleLogout}>
          Log out
        </button>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
