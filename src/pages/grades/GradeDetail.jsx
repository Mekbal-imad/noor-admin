import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const PRAYER_LABELS = { asr: 'بعد العصر', maghrib: 'بعد المغرب', isha: 'بعد العشاء' }
const CLASS_TYPES   = ['قرآن', 'سيرة', 'آداب', 'عقيدة', 'موضوع', 'مسابقة']
const DAYS          = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const LEVELS        = { primary: 'ابتدائي', middle: 'متوسط', high: 'ثانوي' }

const emptyClass = {
  name: '', type: 'قرآن', time_type: 'prayer',
  prayer_time: 'asr', start_time: '', end_time: '',
  days: [], teacher_ids: []
}

export default function GradeDetail() {
  const { id }                    = useParams()
  const navigate                  = useNavigate()
  const [grade, setGrade]         = useState(null)
  const [teachers, setTeachers]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(emptyClass)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [activeTab, setActiveTab] = useState('classes')

  useEffect(() => { fetchGrade(); fetchTeachers() }, [id])

  const fetchGrade = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/admin/grades/${id}`)
      setGrade(res.data)
    } catch { } finally { setLoading(false) }
  }

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/admin/teachers')
      setTeachers(res.data)
    } catch { }
  }

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }))
  }

  const toggleTeacher = (tid) => {
    setForm(prev => ({
      ...prev,
      teacher_ids: prev.teacher_ids.includes(tid)
        ? prev.teacher_ids.filter(t => t !== tid)
        : [...prev.teacher_ids, tid]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post(`/admin/grades/${id}/classes`, {
        ...form,
        days: form.days.join(',')
      })
      setShowModal(false)
      setForm(emptyClass)
      fetchGrade()
    } catch (err) {
      setError(err.response?.data?.message ?? 'حدث خطأ، حاول مجدداً')
    } finally { setSaving(false) }
  }

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الحصة؟')) return
    try {
      await api.delete(`/admin/classes/${classId}`)
      fetchGrade()
    } catch { }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>جاري التحميل...</div>
  )

  if (!grade) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>المرحلة غير موجودة</div>
  )

  return (
    <div style={{ direction: 'rtl' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => navigate('/grades')} style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'white', border: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280' }}>
          <i className="ti ti-arrow-right" style={{ fontSize: '18px' }} aria-hidden="true" />
        </button>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: 0 }}>{grade.name}</h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>{LEVELS[grade.level]}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { icon: 'ti-users',      label: 'الطلاب',  value: grade.students_count ?? 0, bg: '#e6f1fb', color: '#185fa5' },
          { icon: 'ti-book',       label: 'الحصص',   value: grade.classes_count  ?? 0, bg: '#e1f5ee', color: '#0f6e56' },
          { icon: 'ti-chalkboard', label: 'المعلمون', value: grade.teachers?.length ?? 0, bg: '#faeeda', color: '#854f0b' },
        ].map((st, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`ti ${st.icon}`} style={{ fontSize: '22px', color: st.color }} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#111', lineHeight: 1 }}>{st.value}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Teachers Card */}
      <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb', padding: '16px', marginBottom: '20px' }}>
        <p style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#111' }}>المعلمون المعينون</p>
        {grade.teachers?.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>لم يتم تعيين معلمين بعد</p>
        ) : (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {grade.teachers?.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', borderRadius: '10px', padding: '8px 14px', border: '0.5px solid #e5e7eb' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: t.role === 'أساسي' ? '#1a6b5a' : '#c9a227', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '600' }}>
                  {t.name?.charAt(0)}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#111' }}>{t.name}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: t.role === 'أساسي' ? '#0f6e56' : '#854f0b' }}>{t.role ?? 'أساسي'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {[
          { key: 'classes',  label: 'الحصص',  icon: 'ti-book'   },
          { key: 'students', label: 'الطلاب', icon: 'ti-users'  },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px',
            background: activeTab === tab.key ? '#1a6b5a' : '#f3f4f6',
            color: activeTab === tab.key ? 'white' : '#6b7280',
          }}>
            <i className={`ti ${tab.icon}`} aria-hidden="true" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>حصص {grade.name}</p>
            <button onClick={() => { setForm(emptyClass); setError(''); setShowModal(true) }}
              style={{ background: '#1a6b5a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="ti ti-plus" aria-hidden="true" />
              إضافة حصة
            </button>
          </div>

          {grade.classes?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb' }}>
              <i className="ti ti-book-off" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }} aria-hidden="true" />
              لا توجد حصص بعد
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
              {grade.classes?.map(cls => (
                <div key={cls.id} style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e1f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="ti ti-book" style={{ fontSize: '18px', color: '#0f6e56' }} aria-hidden="true" />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111' }}>{cls.name}</p>
                        <span style={{ fontSize: '11px', background: '#e1f5ee', color: '#0f6e56', padding: '2px 8px', borderRadius: '20px' }}>{cls.type}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteClass(cls.id)} style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#fcebeb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a32d2d' }}>
                      <i className="ti ti-trash" style={{ fontSize: '14px' }} aria-hidden="true" />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                      <i className="ti ti-clock" style={{ fontSize: '14px' }} aria-hidden="true" />
                      {cls.time_type === 'prayer'
                        ? PRAYER_LABELS[cls.prayer_time]
                        : `${cls.start_time} — ${cls.end_time}`}
                    </div>
                    {cls.days && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                        <i className="ti ti-calendar" style={{ fontSize: '14px' }} aria-hidden="true" />
                        {cls.days}
                      </div>
                    )}
                    {cls.teachers?.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                        <i className="ti ti-user" style={{ fontSize: '14px' }} aria-hidden="true" />
                        {cls.teachers.map(t => t.name).join(' — ')}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                      <i className="ti ti-users" style={{ fontSize: '14px' }} aria-hidden="true" />
                      {cls.students_count ?? 0} طالب مسجل
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', background: '#f9fafb', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', fontSize: '11px', color: '#6b7280', borderBottom: '0.5px solid #e5e7eb' }}>
            <span>الطالب</span><span>ولي الأمر</span><span>الحالة</span>
          </div>
          {grade.students?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>لا يوجد طلاب في هذه المرحلة</div>
          ) : (
            grade.students?.map((st, i) => (
              <div key={st.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 16px', alignItems: 'center', fontSize: '12px', borderBottom: i < grade.students.length - 1 ? '0.5px solid #f3f4f6' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a6b5a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '600' }}>
                    {st.name?.charAt(0)}
                  </div>
                  <span style={{ fontWeight: '500', color: '#111' }}>{st.name}</span>
                </div>
                <span style={{ color: '#6b7280' }}>{st.parent?.name ?? '—'}</span>
                <span>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: st.status === 'approved' ? '#e1f5ee' : '#faeeda', color: st.status === 'approved' ? '#0f6e56' : '#854f0b' }}>
                    {st.status === 'approved' ? 'مقبول' : 'انتظار'}
                  </span>
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Class Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '540px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

            <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>إضافة حصة جديدة — {grade.name}</span>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '20px' }}>
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px', direction: 'rtl' }}>
              {error && (
                <div style={{ background: '#fcebeb', border: '0.5px solid #fca5a5', color: '#a32d2d', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              {/* Name + Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>اسم الحصة</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="مثال: حصة القرآن الصباحية" required
                    style={{ border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', outline: 'none', textAlign: 'right', background: '#fafafa' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>نوع الحصة</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    style={{ border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', outline: 'none', textAlign: 'right', background: '#fafafa' }}>
                    {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Time Type */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '8px' }}>وقت الحصة</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  {[
                    { key: 'prayer',   label: 'بعد صلاة' },
                    { key: 'specific', label: 'وقت محدد'  },
                  ].map(opt => (
                    <button key={opt.key} type="button" onClick={() => setForm({ ...form, time_type: opt.key })}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '0.5px solid', fontSize: '12px', cursor: 'pointer', borderColor: form.time_type === opt.key ? '#1a6b5a' : '#e5e7eb', background: form.time_type === opt.key ? '#e1f5ee' : '#fafafa', color: form.time_type === opt.key ? '#0f6e56' : '#6b7280', fontWeight: form.time_type === opt.key ? '600' : '400' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>

                {form.time_type === 'prayer' ? (
                  <select value={form.prayer_time} onChange={e => setForm({ ...form, prayer_time: e.target.value })}
                    style={{ width: '100%', border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', outline: 'none', textAlign: 'right', background: '#fafafa' }}>
                    <option value="asr">بعد العصر</option>
                    <option value="maghrib">بعد المغرب</option>
                    <option value="isha">بعد العشاء</option>
                  </select>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '12px', color: '#6b7280' }}>من</label>
                      <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })}
                        style={{ border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', outline: 'none', background: '#fafafa' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '12px', color: '#6b7280' }}>إلى</label>
                      <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })}
                        style={{ border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', outline: 'none', background: '#fafafa' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Days */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '8px' }}>أيام الحصة</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {DAYS.map(day => (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '0.5px solid', fontSize: '12px', cursor: 'pointer', borderColor: form.days.includes(day) ? '#1a6b5a' : '#e5e7eb', background: form.days.includes(day) ? '#e1f5ee' : '#fafafa', color: form.days.includes(day) ? '#0f6e56' : '#6b7280', fontWeight: form.days.includes(day) ? '600' : '400' }}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Teachers */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '8px' }}>المعلمون</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {teachers.map(t => {
                    const selected = form.teacher_ids.includes(t.id)
                    return (
                      <button key={t.id} type="button" onClick={() => toggleTeacher(t.id)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '0.5px solid', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', textAlign: 'right', borderColor: selected ? '#1a6b5a' : '#e5e7eb', background: selected ? '#e1f5ee' : '#fafafa', color: selected ? '#0f6e56' : '#374151' }}>
                        <i className={`ti ${selected ? 'ti-check' : 'ti-user'}`} style={{ fontSize: '14px' }} aria-hidden="true" />
                        <span>{t.name}</span>
                        <span style={{ fontSize: '10px', opacity: 0.7, marginRight: 'auto' }}>{t.role ?? 'أساسي'}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={saving} style={{ background: '#1a6b5a', color: 'white', border: 'none', borderRadius: '9px', padding: '10px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  {saving ? 'جاري الحفظ...' : 'إضافة الحصة'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '9px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}