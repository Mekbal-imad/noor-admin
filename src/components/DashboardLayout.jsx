import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const menuItems = [
  { icon: 'ti-layout-dashboard', label: 'الرئيسية',   path: '/dashboard'     },
  { icon: 'ti-users',            label: 'المعلمون',   path: '/teachers'      },
  { icon: 'ti-school',           label: 'الطلاب',     path: '/students'      },
  { icon: 'ti-school',         label: 'المراحل',    path: '/grades'        },
  { icon: 'ti-clipboard-list',   label: 'الاختبارات', path: '/exams'         },
  { icon: 'ti-chart-bar',        label: 'الإحصائيات', path: '/stats'         },
  { icon: 'ti-bell',             label: 'الإشعارات',  path: '/notifications' },
]

const s = {
  dash:    { display: 'flex', flexDirection: 'row-reverse', minHeight: '100vh', background: '#f0f2f5', fontFamily: "'Changa', 'Segoe UI', sans-serif" },
  sidebar: { background: '#1a6b5a', minHeight: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.25s' },
  sbHdr:   { padding: '16px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' },
  sbLogo:  { width: '34px', height: '34px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sbNav:   { flex: 1, paddingTop: '8px' },
  sbSec:   { padding: '8px 14px 4px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', direction: 'rtl' },
  sbFoot:  { padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  main:    { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar:  { background: 'white', padding: '0 24px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid #e5e7eb' },
  content: { flex: 1, overflowY: 'auto', padding: '20px' },
}

export default function DashboardLayout() {
  const [sbOpen, setSbOpen] = useState(true)
  const { user, logout }    = useAuth()
  const navigate            = useNavigate()
  const location            = useLocation()

  const handleLogout = async () => { await logout(); navigate('/login') }
  const currentPage  = menuItems.find(m => location.pathname.startsWith(m.path))

  return (
    <div style={s.dash}>

      {/* ── Sidebar ── */}
      <div style={{ ...s.sidebar, width: sbOpen ? '220px' : '64px' }}>
        <div style={s.sbHdr}>
          <div style={s.sbLogo}>
            <img src="/logo.png" alt="نور" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          </div>
          {sbOpen && <span style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>نظام نور</span>}
        </div>

        <div style={s.sbNav}>
          {sbOpen && <div style={s.sbSec}>القائمة الرئيسية</div>}
          {menuItems.slice(0, 5).map(item => (
            <button key={item.path} onClick={() => navigate(item.path)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '11px 14px',
              background: location.pathname === item.path ? 'rgba(255,255,255,0.12)' : 'transparent',
              borderRight: location.pathname === item.path ? '3px solid #c9a227' : '3px solid transparent',
              borderLeft: 'none', borderTop: 'none', borderBottom: 'none',
              color: location.pathname === item.path ? 'white' : 'rgba(255,255,255,0.65)',
              cursor: 'pointer', direction: 'rtl', fontSize: '13px',
            }}>
              <i className={`ti ${item.icon}`} style={{ fontSize: '18px', flexShrink: 0 }} aria-hidden="true" />
              {sbOpen && <span>{item.label}</span>}
            </button>
          ))}

          {sbOpen && <div style={{ ...s.sbSec, marginTop: '8px' }}>التقارير</div>}
          {menuItems.slice(5).map(item => (
            <button key={item.path} onClick={() => navigate(item.path)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '11px 14px',
              background: location.pathname === item.path ? 'rgba(255,255,255,0.12)' : 'transparent',
              borderRight: location.pathname === item.path ? '3px solid #c9a227' : '3px solid transparent',
              borderLeft: 'none', borderTop: 'none', borderBottom: 'none',
              color: location.pathname === item.path ? 'white' : 'rgba(255,255,255,0.65)',
              cursor: 'pointer', direction: 'rtl', fontSize: '13px',
            }}>
              <i className={`ti ${item.icon}`} style={{ fontSize: '18px', flexShrink: 0 }} aria-hidden="true" />
              {sbOpen && <span>{item.label}</span>}
            </button>
          ))}
        </div>

        <button onClick={handleLogout} style={{
          ...s.sbFoot, display: 'flex', alignItems: 'center', gap: '10px',
          direction: 'rtl', background: 'none', border: 'none',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer', width: '100%', color: 'rgba(255,255,255,0.7)',
        }}>
          <i className="ti ti-logout" style={{ fontSize: '18px', flexShrink: 0 }} aria-hidden="true" />
          {sbOpen && <span style={{ fontSize: '13px' }}>تسجيل الخروج</span>}
        </button>
      </div>

      {/* ── Main ── */}
      <div style={s.main}>

        {/* Topbar */}
        <div style={s.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setSbOpen(!sbOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#6b7280', display: 'flex' }}>
              <i className="ti ti-menu-2" aria-hidden="true" />
            </button>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>
              {currentPage?.label ?? 'لوحة التحكم'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', direction: 'rtl' }}>
            <div style={{ background: '#f3f4f6', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <i className="ti ti-calendar" style={{ fontSize: '13px' }} aria-hidden="true" />
              الخميس 30 مايو 2026
            </div>
            <button style={{ background: 'none', border: '0.5px solid #e5e7eb', borderRadius: '8px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', color: '#6b7280' }}>
              <i className="ti ti-bell" style={{ fontSize: '17px' }} aria-hidden="true" />
              <span style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', background: '#e05c5c', borderRadius: '50%' }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', direction: 'rtl' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#111' }}>{user?.name}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>مدير النظام</p>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1a6b5a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '14px' }}>
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={s.content}>
          <Outlet />
        </div>

      </div>
    </div>
  )
}