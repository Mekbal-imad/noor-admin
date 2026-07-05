import { useState, useEffect } from 'react'
import api from '../../api/axios'

const GENDERS = { male: 'ذكر', female: 'أنثى' }

const emptyForm = {
  name: '', email: '', password: '',
  phone: '', gender: 'male', specialization: '', role: 'أساسي'
}

export default function Teachers() {
  const [teachers, setTeachers]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [search, setSearch]       = useState('')
  const [deleting, setDeleting]   = useState(null)

  useEffect(() => { fetchTeachers() }, [])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/teachers')
      setTeachers(res.data)
    } catch { } finally { setLoading(false) }
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  const openEdit = (teacher) => {
    setEditing(teacher)
    setForm({
      name: teacher.name, email: teacher.email,
      password: '', phone: teacher.phone ?? '',
      gender: teacher.gender, specialization: teacher.specialization ?? '',
role: teacher.role ?? 'أساسي'
    })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await api.put(`/admin/teachers/${editing.id}`, form)
      } else {
        await api.post('/admin/teachers', form)
      }
      setShowModal(false)
      fetchTeachers()
    } catch (err) {
      setError(err.response?.data?.message ?? 'حدث خطأ، حاول مجدداً')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المعلم؟')) return
    setDeleting(id)
    try {
      await api.delete(`/admin/teachers/${id}`)
      fetchTeachers()
    } catch { } finally { setDeleting(null) }
  }

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  )

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2)

  const colors = ['#1a6b5a', '#c9a227', '#185fa5', '#a32d2d', '#7c3aed', '#0369a1']
  const color  = (i) => colors[i % colors.length]

  return (
    <div style={{ direction: 'rtl' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: 0 }}>المعلمون</h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>إدارة قائمة المعلمين</p>
        </div>
        <button onClick={openAdd} style={{ background: '#1a6b5a', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i className="ti ti-plus" aria-hidden="true" />
          إضافة معلم
        </button>
      </div>

      {/* Search + Stats */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
        <div style={{ flex: 1, background: 'white', borderRadius: '10px', border: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px' }}>
          <i className="ti ti-search" style={{ color: '#9ca3af', fontSize: '16px' }} aria-hidden="true" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث عن معلم..."
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '13px', textAlign: 'right', background: 'transparent' }}
          />
        </div>
        <div style={{ background: 'white', borderRadius: '10px', border: '0.5px solid #e5e7eb', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="ti ti-users" style={{ color: '#1a6b5a', fontSize: '16px' }} aria-hidden="true" />
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{teachers.length}</span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>معلم</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px', padding: '10px 16px', background: '#f9fafb', fontSize: '11px', color: '#6b7280', borderBottom: '0.5px solid #e5e7eb' }}>
          <span>المعلم</span><span>البريد الإلكتروني</span><span>الفصل</span><span>الدور</span><span>الجنس</span><span style={{ textAlign: 'center' }}>إجراءات</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            <i className="ti ti-loader" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }} aria-hidden="true" />
            جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            <i className="ti ti-users-off" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }} aria-hidden="true" />
            لا يوجد معلمون
          </div>
        ) : (
          filtered.map((t, i) => (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px', padding: '12px 16px', alignItems: 'center', borderBottom: i < filtered.length - 1 ? '0.5px solid #f3f4f6' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: color(i), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '600', flexShrink: 0 }}>
                  {initials(t.name)}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#111' }}>{t.name}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{t.phone ?? '—'}</p>
                </div>
              </div>

              <span style={{ fontSize: '12px', color: '#6b7280' }}>{t.email}</span>
              <span style={{ fontSize: '12px', color: '#374151' }}>{t.specialization ?? '—'}</span>
<span>
  <span style={{ background: t.role === 'أساسي' ? '#e1f5ee' : '#faeeda', color: t.role === 'أساسي' ? '#0f6e56' : '#854f0b', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
    {t.role ?? 'أساسي'}
  </span>
</span>
              <span>
                <span style={{ background: t.gender === 'male' ? '#e6f1fb' : '#fce7f3', color: t.gender === 'male' ? '#185fa5' : '#9d174d', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
                  {GENDERS[t.gender]}
                </span>
              </span>

              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                <button onClick={() => openEdit(t)} style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#e6f1fb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#185fa5' }}>
                  <i className="ti ti-edit" style={{ fontSize: '15px' }} aria-hidden="true" />
                </button>
                <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id} style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#fcebeb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a32d2d' }}>
                  <i className={`ti ${deleting === t.id ? 'ti-loader' : 'ti-trash'}`} style={{ fontSize: '15px' }} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '480px', maxWidth: '95vw', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl' }}>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>
                {editing ? 'تعديل معلم' : 'إضافة معلم جديد'}
              </span>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '20px', display: 'flex' }}>
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ padding: '20px', direction: 'rtl' }}>
              {error && (
                <div style={{ background: '#fcebeb', border: '0.5px solid #fca5a5', color: '#a32d2d', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'الاسم الكامل', key: 'name',           type: 'text',     placeholder: 'أحمد محمد',         required: true  },
                  { label: 'البريد الإلكتروني', key: 'email',     type: 'email',    placeholder: 'ahmed@noor.com',    required: true  },
                  { label: 'كلمة المرور',   key: 'password',      type: 'password', placeholder: editing ? 'اتركه فارغاً للإبقاء' : '••••••••', required: !editing },
                  { label: 'رقم الهاتف',   key: 'phone',          type: 'text',     placeholder: '0551234567',        required: false },
                  { label: 'الفصل', key: 'specialization', type: 'text', placeholder: 'الفصل الدراسي', required: false },
                ].map(field => (
                  <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={form[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      required={field.required}
                      style={{ border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', outline: 'none', textAlign: 'right', background: '#fafafa' }}
                    />
                  </div>
                ))}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>الجنس</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                    style={{ border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', outline: 'none', textAlign: 'right', background: '#fafafa' }}>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
  <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>الدور</label>
  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
    style={{ border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', outline: 'none', textAlign: 'right', background: '#fafafa' }}>
    <option value="أساسي">أساسي</option>
    <option value="معين">معين</option>
  </select>
</div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-start' }}>
                <button type="submit" disabled={saving} style={{ background: '#1a6b5a', color: 'white', border: 'none', borderRadius: '9px', padding: '10px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  {saving ? 'جاري الحفظ...' : editing ? 'حفظ التعديلات' : 'إضافة المعلم'}
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