import { useState, useEffect } from 'react'
import api from '../api/axios'

const PERIODS = [
  { key: 'week',  label: 'هذا الأسبوع' },
  { key: 'month', label: 'هذا الشهر'   },
  { key: 'year',  label: 'هذه السنة'   },
]

const LEVELS = {
  primary: { label: 'ابتدائي', color: '#0f6e56', bg: '#e1f5ee' },
  middle:  { label: 'متوسط',  color: '#185fa5', bg: '#e6f1fb' },
  high:    { label: 'ثانوي',  color: '#854f0b', bg: '#faeeda' },
}

export default function Stats() {
  const [overview, setOverview]         = useState(null)
  const [grades, setGrades]             = useState([])
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [gradeStats, setGradeStats]     = useState(null)
  const [period, setPeriod]             = useState('month')
  const [loading, setLoading]           = useState(true)
  const [loadingGrade, setLoadingGrade] = useState(false)

  useEffect(() => { fetchOverview() }, [])

  useEffect(() => {
    if (selectedGrade) fetchGradeStats(selectedGrade.id, period)
  }, [period])

  const fetchOverview = async () => {
    try {
      const res = await api.get('/admin/stats/overview')
      setOverview(res.data)
      setGrades(res.data.grades)
    } catch { } finally { setLoading(false) }
  }

  const fetchGradeStats = async (gradeId, p) => {
    setLoadingGrade(true)
    try {
      const res = await api.get(`/admin/stats/grades/${gradeId}`, { params: { period: p } })
      setGradeStats(res.data)
    } catch { } finally { setLoadingGrade(false) }
  }

  const selectGrade = (grade) => {
    setSelectedGrade(grade)
    setGradeStats(null)
    fetchGradeStats(grade.id, period)
  }

  const StatCard = ({ label, value, icon, color, bg, sub }) => (
    <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className={`ti ${icon}`} style={{ fontSize: '20px', color }} aria-hidden="true" />
      </div>
      <div>
        <div style={{ fontSize: '22px', fontWeight: '700', color: '#111', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{label}</div>
        {sub && <div style={{ fontSize: '10px', color, marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  )

  // Simple bar chart using divs
  const BarChart = ({ data }) => {
    const max = Math.max(...data.map(d => d.total || 1))
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px', padding: '0 4px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'flex-end', height: '60px' }}>
              {d.total > 0 && (
                <div style={{ width: '100%', height: `${(d.present / max) * 60}px`, background: '#1a6b5a', borderRadius: '4px 4px 0 0', minHeight: '4px' }} title={`حاضر: ${d.present}`} />
              )}
              {d.total > 0 && d.total - d.present > 0 && (
                <div style={{ width: '100%', height: `${((d.total - d.present) / max) * 60}px`, background: '#fca5a5', borderRadius: '0', minHeight: '2px' }} title={`غائب/متأخر: ${d.total - d.present}`} />
              )}
            </div>
            <span style={{ fontSize: '10px', color: '#9ca3af', textAlign: 'center' }}>{d.label?.slice(0, 3)}</span>
          </div>
        ))}
      </div>
    )
  }

  // Donut-like progress ring using SVG
  const RingChart = ({ value, max = 100, color, size = 80 }) => {
    const r = 28
    const circ = 2 * Math.PI * r
    const pct = Math.min(value / max, 1)
    return (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${pct * circ} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 32 32)" />
        <text x="32" y="36" textAnchor="middle" fontSize="12" fontWeight="700" fill="#111">{value}%</text>
      </svg>
    )
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', direction: 'rtl' }}>جاري التحميل...</div>
  )

  return (
    <div style={{ direction: 'rtl' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: 0 }}>الإحصائيات والتقارير</h1>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>نظرة شاملة على أداء المدرسة</p>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          <StatCard label="إجمالي المراحل"   value={overview.total_grades}         icon="ti-layout-grid"  color="#185fa5" bg="#e6f1fb" />
          <StatCard label="إجمالي الطلاب"    value={overview.total_students}        icon="ti-users"        color="#0f6e56" bg="#e1f5ee" />
          <StatCard label="حصص منعقدة اليوم" value={overview.classes_held_today}   icon="ti-check"        color="#0f6e56" bg="#e1f5ee" sub={`${overview.classes_missed_today} لم تنعقد`} />
          <StatCard label="غياب اليوم"        value={overview.absent_today}         icon="ti-user-off"     color="#a32d2d" bg="#fcebeb" />
        </div>
      )}

      {/* Grade Selector */}
      <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb', padding: '16px', marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>اختر مرحلة لعرض تفاصيلها</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {grades.map(g => (
            <button key={g.id} onClick={() => selectGrade(g)}
              style={{ padding: '7px 14px', borderRadius: '8px', border: '0.5px solid', cursor: 'pointer', fontSize: '12px', fontWeight: '500', borderColor: selectedGrade?.id === g.id ? '#1a6b5a' : '#e5e7eb', background: selectedGrade?.id === g.id ? '#1a6b5a' : '#f9fafb', color: selectedGrade?.id === g.id ? 'white' : '#374151' }}>
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grade Stats */}
      {selectedGrade && (
        <div>
          {/* Period Selector */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: period === p.key ? '700' : '400', background: period === p.key ? '#1a6b5a' : '#f3f4f6', color: period === p.key ? 'white' : '#6b7280' }}>
                {p.label}
              </button>
            ))}
          </div>

          {loadingGrade ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>جاري التحميل...</div>
          ) : gradeStats && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Attendance Overview */}
              <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb', padding: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '14px' }}>نسبة الحضور — {selectedGrade.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                  <RingChart value={gradeStats.attendance.rate} color="#1a6b5a" size={90} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    {[
                      { label: 'حاضر',  value: gradeStats.attendance.present, color: '#0f6e56', bg: '#e1f5ee' },
                      { label: 'غائب',  value: gradeStats.attendance.absent,  color: '#a32d2d', bg: '#fcebeb' },
                      { label: 'متأخر', value: gradeStats.attendance.late,    color: '#854f0b', bg: '#faeeda' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily Chart */}
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>الحضور آخر 7 أيام</p>
                <BarChart data={gradeStats.attendance.daily} />
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '10px', color: '#9ca3af' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#1a6b5a' }} />
                    <span>حاضر</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#fca5a5' }} />
                    <span>غائب/متأخر</span>
                  </div>
                </div>
              </div>

              {/* Classes Held vs Missed */}
              <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb', padding: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '14px' }}>انعقاد الحصص</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {[
                    { label: 'منعقدة',    value: gradeStats.classes.held,   color: '#0f6e56', bg: '#e1f5ee', icon: 'ti-check'     },
                    { label: 'لم تنعقد', value: gradeStats.classes.missed, color: '#a32d2d', bg: '#fcebeb', icon: 'ti-x'          },
                    { label: 'الإجمالي', value: gradeStats.classes.total,  color: '#185fa5', bg: '#e6f1fb', icon: 'ti-calendar'   },
                  ].map((item, i) => (
                    <div key={i} style={{ background: item.bg, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <i className={`ti ${item.icon}`} style={{ fontSize: '20px', color: item.color, display: 'block', marginBottom: '4px' }} aria-hidden="true" />
                      <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111' }}>{item.value}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: item.color, marginTop: '2px' }}>{item.label}</p>
                    </div>
                  ))}
                </div>
                {gradeStats.classes.total > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                      <span>نسبة انعقاد الحصص</span>
                      <span>{Math.round((gradeStats.classes.held / gradeStats.classes.total) * 100)}%</span>
                    </div>
                    <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '20px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#1a6b5a', borderRadius: '20px', width: `${Math.round((gradeStats.classes.held / gradeStats.classes.total) * 100)}%`, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Memorization Stats */}
              <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb', padding: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '14px' }}>إحصائيات الحفظ</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '12px' }}>
                  {[
                    { label: 'متوسط العلامة', value: `${gradeStats.memorization.avg_grade}/10`, color: '#0f6e56', bg: '#e1f5ee' },
                    { label: 'حفظ جديد',      value: gradeStats.memorization.memorization,      color: '#185fa5', bg: '#e6f1fb' },
                    { label: 'مراجعة',         value: gradeStats.memorization.revision,          color: '#854f0b', bg: '#faeeda' },
                    { label: 'تثبيت',          value: gradeStats.memorization.confirmation,      color: '#7c3aed', bg: '#f5f3ff' },
                  ].map((item, i) => (
                    <div key={i} style={{ background: item.bg, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111' }}>{item.value}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: item.color, marginTop: '2px' }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Students Table */}
              <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #e5e7eb' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111' }}>تفاصيل الطلاب</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.5fr', padding: '8px 16px', background: '#f9fafb', fontSize: '11px', color: '#6b7280' }}>
  <span>الطالب</span><span>نسبة الحضور</span><span>متوسط الحفظ</span><span>الحصص</span><span>آخر حفظ</span>
</div>
                {gradeStats.students.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>لا يوجد طلاب</div>
                ) : (
                  gradeStats.students.map((st, i) => (
                    <div key={st.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.5fr', padding: '10px 16px', alignItems: 'center', borderBottom: i < gradeStats.students.length - 1 ? '0.5px solid #f3f4f6' : 'none', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a6b5a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: '600', flexShrink: 0 }}>
                          {st.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: '500', color: '#111' }}>{st.name}</span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ flex: 1, height: '6px', background: '#f3f4f6', borderRadius: '20px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: st.attendance_rate >= 75 ? '#1a6b5a' : st.attendance_rate >= 50 ? '#c9a227' : '#e05c5c', borderRadius: '20px', width: `${st.attendance_rate}%` }} />
                          </div>
                          <span style={{ fontSize: '11px', color: '#374151', minWidth: '30px' }}>{st.attendance_rate}%</span>
                        </div>
                      </div>
                      <span style={{ color: '#374151', fontWeight: '500' }}>{st.avg_grade}/10</span>
                      <span style={{ color: '#6b7280' }}>{st.total_sessions}</span>
                      <div>
  {st.last_memorization ? (
    <div>
      <p style={{ margin: 0, fontSize: '11px', fontWeight: '500', color: '#111' }}>
        {st.last_memorization.from_surah} ({st.last_memorization.from_ayah}) ← {st.last_memorization.to_surah} ({st.last_memorization.to_ayah})
      </p>
      <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
        علامة: {st.last_memorization.grade}/10
      </p>
    </div>
  ) : (
    <span style={{ color: '#d1d5db', fontSize: '11px' }}>لا يوجد</span>
  )}
</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}