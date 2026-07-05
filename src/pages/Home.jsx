const stats = [
  { icon: 'ti-users',  label: 'المعلمون',           value: '١٢',  trend: '+٢ هذا الشهر',  bg: '#e1f5ee', color: '#0f6e56' },
  { icon: 'ti-school', label: 'الطلاب المقبولون',   value: '١٤٨', trend: '+١٢ هذا الشهر', bg: '#faeeda', color: '#854f0b' },
  { icon: 'ti-clock',  label: 'بانتظار الموافقة',   value: '٥',   trend: 'يحتاج مراجعة',  bg: '#fcebeb', color: '#a32d2d' },
  { icon: 'ti-book',   label: 'الفصول النشطة',      value: '٢٤',  trend: '+٣ هذا الشهر',  bg: '#e6f1fb', color: '#185fa5' },
]

const recentStudents = [
  { name: 'أحمد محمد',   initials: 'أح', color: '#1a6b5a', class: 'القرآن — ابتدائي ٣', status: 'مقبول',  statusClass: 'green', date: '28 مايو' },
  { name: 'يوسف علي',    initials: 'يو', color: '#c9a227', class: 'سيرة — متوسط ١',     status: 'انتظار', statusClass: 'amber', date: '27 مايو' },
  { name: 'سارة خالد',   initials: 'سا', color: '#185fa5', class: 'آداب — ثانوي ١',      status: 'مقبول',  statusClass: 'green', date: '26 مايو' },
  { name: 'عمر عبدالله', initials: 'عم', color: '#a32d2d', class: 'القرآن — ابتدائي ٤', status: 'مرفوض', statusClass: 'red',   date: '25 مايو' },
]

const quickActions = [
  { icon: 'ti-user-plus', label: 'إضافة معلم',  bg: '#e1f5ee', color: '#0f6e56', path: '/teachers' },
  { icon: 'ti-check',     label: 'قبول طلاب',   bg: '#faeeda', color: '#854f0b', path: '/students' },
  { icon: 'ti-school',    label: 'إنشاء فصل',   bg: '#e6f1fb', color: '#185fa5', path: '/classes'  },
  { icon: 'ti-clipboard', label: 'جدول اختبار', bg: '#fcebeb', color: '#a32d2d', path: '/exams'    },
]

const notifications = [
  { text: 'طالب جديد في انتظار الموافقة',    time: 'منذ ١٠ دقائق', color: '#1a6b5a' },
  { text: 'اختبار القرآن غداً الساعة ٩ صباحاً', time: 'منذ ساعة',    color: '#c9a227' },
  { text: 'تم إضافة معلم جديد بنجاح',        time: 'منذ ساعتين',   color: '#1a6b5a' },
]

const badgeStyle = {
  green: { background: '#e1f5ee', color: '#0f6e56' },
  amber: { background: '#faeeda', color: '#854f0b' },
  red:   { background: '#fcebeb', color: '#a32d2d' },
}

import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
        {stats.map((st, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '14px', direction: 'rtl' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '11px', background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`ti ${st.icon}`} style={{ fontSize: '22px', color: st.color }} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#111', lineHeight: 1 }}>{st.value}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px' }}>{st.label}</div>
              <div style={{ fontSize: '10px', color: st.color, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <i className="ti ti-trending-up" style={{ fontSize: '11px' }} aria-hidden="true" />
                {st.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>

        {/* Recent Students */}
        <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl' }}>
            <span style={{ fontSize: '11px', color: '#1a6b5a', cursor: 'pointer' }} onClick={() => navigate('/students')}>عرض الكل</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>آخر الطلاب المسجلين</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 80px 70px', padding: '8px 16px', background: '#f9fafb', direction: 'rtl', fontSize: '11px', color: '#6b7280' }}>
            <span>الطالب</span><span>الفصل</span><span>الحالة</span><span>التاريخ</span>
          </div>
          {recentStudents.map((st, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 80px 70px', padding: '10px 16px', alignItems: 'center', direction: 'rtl', borderBottom: i < recentStudents.length - 1 ? '0.5px solid #f3f4f6' : 'none', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: st.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                  {st.initials}
                </div>
                <span style={{ color: '#111', fontWeight: '500' }}>{st.name}</span>
              </div>
              <span style={{ color: '#6b7280' }}>{st.class}</span>
              <span><span style={{ ...badgeStyle[st.statusClass], padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '500' }}>{st.status}</span></span>
              <span style={{ color: '#9ca3af' }}>{st.date}</span>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Quick Actions */}
          <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e5e7eb', direction: 'rtl' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>إجراءات سريعة</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px' }}>
              {quickActions.map((a, i) => (
                <button key={i} onClick={() => navigate(a.path)} style={{ background: '#f9fafb', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', direction: 'rtl', border: '0.5px solid #e5e7eb' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`ti ${a.icon}`} style={{ fontSize: '16px', color: a.color }} aria-hidden="true" />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', direction: 'rtl' }}>
              <span style={{ fontSize: '11px', color: '#1a6b5a', cursor: 'pointer' }}>الكل</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>الإشعارات</span>
            </div>
            {notifications.map((n, i) => (
              <div key={i} style={{ padding: '10px 16px', display: 'flex', alignItems: 'flex-start', gap: '10px', direction: 'rtl', borderBottom: i < notifications.length - 1 ? '0.5px solid #f3f4f6' : 'none' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.color, marginTop: '5px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>{n.text}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}