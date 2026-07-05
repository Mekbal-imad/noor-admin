import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const LEVELS = {
  primary: { label: 'ابتدائي', bg: '#e1f5ee', color: '#0f6e56' },
  middle:  { label: 'متوسط',  bg: '#e6f1fb', color: '#185fa5' },
  high:    { label: 'ثانوي',  bg: '#faeeda', color: '#854f0b' },
}

const emptyForm = { name: '', level: 'primary', order: '', teacher_ids: [] }

export default function Grades() {
  const [grades, setGrades]       = useState([])
  const [teachers, setTeachers]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [filter, setFilter]       = useState('all')
  const navigate                  = useNavigate()

  useEffect(() => { fetchGrades(); fetchTeachers() }, [])

  const fetchGrades = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/grades')
      setGrades(res.data)
    } catch { } finally { setLoading(false) }
  }

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/admin/teachers')
      setTeachers(res.data)
    } catch { }
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  const openEdit = (grade) => {
    setEditing(grade)
    setForm({
      name:        grade.name,
      level:       grade.level,
      order:       grade.order ?? '',
      teacher_ids: grade.teachers?.map(t => t.id) ?? [],
    })
    setError('')
    setShowModal(true)
  }

  const toggleTeacher = (id) => {
    setForm(prev => {
      const ids = prev.teacher_ids.includes(id)
        ? prev.teacher_ids.filter(t => t !== id)
        : prev.teacher_ids.length < 2
          ? [...prev.teacher_ids, id]
          : prev.teacher_ids
      return { ...prev, teacher_ids: ids }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await api.put(`/admin/grades/${editing.id}`, form)
      } else {
        await api.post('/admin/grades', form)
      }
      setShowModal(false)
      fetchGrades()
    } catch (err) {
      setError(err.response?.data?.message ?? 'حدث خطأ، حاول مجدداً')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المرحلة؟')) return
    try {
      await api.delete(`/admin/grades/${id}`)
      fetchGrades()
    } catch { }
  }

  const filtered = filter === 'all' ? grades : grades.filter(g => g.level === filter)

  const counts = {
    all:     grades.length,
    primary: grades.filter(g => g.level === 'primary').length,
    middle:  grades.filter(g => g.level === 'middle').length,
    high:    grades.filter(g => g.level === 'high').length,
  }

  return (
    <div style={{ direction: 'rtl' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: 0 }}>المراحل الدراسية</h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>إدارة المراحل وحصصها ومعلميها</p>
        </div>
        <button onClick={openAdd} style={{ background: '#1a6b5a', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i className="ti ti-plus" aria-hidden="true" />
          إضافة مرحلة
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'إجمالي المراحل', value: counts.all,     bg: '#f3f4f6', color: '#374151', icon: 'ti-layout-grid' },
          { label: 'ابتدائي',        value: counts.primary, bg: '#e1f5ee', color: '#0f6e56', icon: 'ti-school'      },
          { label: 'متوسط',          value: counts.middle,  bg: '#e6f1fb', color: '#185fa5', icon: 'ti-school'      },
          { label: 'ثانوي',          value: counts.high,    bg: '#faeeda', color: '#854f0b', icon: 'ti-school'      },
        ].map((st, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`ti ${st.icon}`} style={{ fontSize: '20px', color: st.color }} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#111', lineHeight: 1 }}>{st.value}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {[
          { key: 'all',     label: 'الكل'    },
          { key: 'primary', label: 'ابتدائي' },
          { key: 'middle',  label: 'متوسط'   },
          { key: 'high',    label: 'ثانوي'   },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
            padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '12px', fontWeight: '500',
            background: filter === tab.key ? '#1a6b5a' : '#f3f4f6',
            color: filter === tab.key ? 'white' : '#6b7280',
          }}>
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      {/* Grades Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb' }}>
          <i className="ti ti-school-off" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }} aria-hidden="true" />
          لا توجد مراحل دراسية
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
          {filtered.map((grade) => (
            <div key={grade.id} style={{ background: 'white', borderRadius: '14px', border: '0.5px solid #e5e7eb', overflow: 'hidden', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

              {/* Card Header */}
              <div style={{ padding: '16px', borderBottom: '0.5px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: LEVELS[grade.level]?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ti ti-school" style={{ fontSize: '20px', color: LEVELS[grade.level]?.color }} aria-hidden="true" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111' }}>{grade.name}</p>
                    <span style={{ fontSize: '11px', background: LEVELS[grade.level]?.bg, color: LEVELS[grade.level]?.color, padding: '2px 8px', borderRadius: '20px', fontWeight: '500' }}>
                      {LEVELS[grade.level]?.label}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(grade) }} style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#e6f1fb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#185fa5' }}>
                    <i className="ti ti-edit" style={{ fontSize: '15px' }} aria-hidden="true" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(grade.id) }} style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#fcebeb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a32d2d' }}>
                    <i className="ti ti-trash" style={{ fontSize: '15px' }} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '12px 16px', gap: '8px' }}>
                {[
                  { icon: 'ti-users',        label: 'طالب',  value: grade.students_count ?? 0, color: '#185fa5' },
                  { icon: 'ti-book',         label: 'حصة',   value: grade.classes_count  ?? 0, color: '#0f6e56' },
                  { icon: 'ti-chalkboard',   label: 'معلم',  value: grade.teachers?.length ?? 0, color: '#854f0b' },
                ].map((st, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '8px', background: '#f9fafb', borderRadius: '8px' }}>
                    <i className={`ti ${st.icon}`} style={{ fontSize: '16px', color: st.color, display: 'block', marginBottom: '3px' }} aria-hidden="true" />
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111' }}>{st.value}</p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>{st.label}</p>
                  </div>
                ))}
              </div>

              {/* Teachers */}
              {grade.teachers?.length > 0 && (
                <div style={{ padding: '10px 16px', borderTop: '0.5px solid #f3f4f6' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#6b7280' }}>المعلمون:</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {grade.teachers.map(t => (
                      <span key={t.id} style={{ fontSize: '11px', background: t.role === 'أساسي' ? '#e1f5ee' : '#faeeda', color: t.role === 'أساسي' ? '#0f6e56' : '#854f0b', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' }}>
                        {t.name} — {t.role ?? 'أساسي'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* View Details Button */}
              <div style={{ padding: '12px 16px', borderTop: '0.5px solid #f3f4f6' }}>
                <button onClick={() => navigate(`/grades/${grade.id}`)} style={{ width: '100%', background: '#1a6b5a', color: 'white', border: 'none', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <i className="ti ti-eye" aria-hidden="true" />
                  عرض التفاصيل
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '500px', maxWidth: '95vw', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

            <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl' }}>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>
                {editing ? 'تعديل مرحلة' : 'إضافة مرحلة جديدة'}
              </span>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>اسم المرحلة</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="مثال: متوسط ١"
                    required
                    style={{ border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', outline: 'none', textAlign: 'right', background: '#fafafa' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>المستوى</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}
                    style={{ border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', outline: 'none', textAlign: 'right', background: '#fafafa' }}>
                    <option value="primary">ابتدائي</option>
                    <option value="middle">متوسط</option>
                    <option value="high">ثانوي</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>الترتيب</label>
                  <input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })}
                    placeholder="١"
                    style={{ border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', outline: 'none', textAlign: 'right', background: '#fafafa' }} />
                </div>
              </div>

              {/* Teacher Selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '8px' }}>
                  المعلمون (حد أقصى ٢)
                  <span style={{ fontSize: '11px', color: '#9ca3af', marginRight: '6px' }}>
                    {form.teacher_ids.length}/٢ تم الاختيار
                  </span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                  {teachers.map(t => {
                    const selected = form.teacher_ids.includes(t.id)
                    const disabled = !selected && form.teacher_ids.length >= 2
                    return (
                      <button key={t.id} type="button" onClick={() => !disabled && toggleTeacher(t.id)}
                        style={{
                          padding: '8px 12px', borderRadius: '8px', border: '0.5px solid',
                          borderColor: selected ? '#1a6b5a' : '#e5e7eb',
                          background: selected ? '#e1f5ee' : '#fafafa',
                          color: selected ? '#0f6e56' : disabled ? '#d1d5db' : '#374151',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          fontSize: '12px', textAlign: 'right',
                          display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                        <i className={`ti ${selected ? 'ti-check' : 'ti-user'}`} style={{ fontSize: '14px' }} aria-hidden="true" />
                        <span>{t.name}</span>
                        <span style={{ fontSize: '10px', opacity: 0.7, marginRight: 'auto' }}>{t.role ?? 'أساسي'}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                <button type="submit" disabled={saving} style={{ background: '#1a6b5a', color: 'white', border: 'none', borderRadius: '9px', padding: '10px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  {saving ? 'جاري الحفظ...' : editing ? 'حفظ التعديلات' : 'إضافة المرحلة'}
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