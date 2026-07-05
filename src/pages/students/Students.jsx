import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import api from '../../api/axios'

const STATUS = {
  approved: { label: 'مقبول',  bg: '#e1f5ee', color: '#0f6e56' },
  pending:  { label: 'انتظار', bg: '#faeeda', color: '#854f0b' },
  rejected: { label: 'مرفوض', bg: '#fcebeb', color: '#a32d2d' },
}

const colors = ['#1a6b5a','#c9a227','#185fa5','#a32d2d','#7c3aed','#0369a1']
const color  = (i) => colors[i % colors.length]
const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2)

const emptyAddForm = {
  name: '', grade_id: '', health_condition: '',
  parent_name: '', parent_email: '', parent_phone: ''
}

// Flexible column matching for the spreadsheet
const COLUMN_ALIASES = {
  name:             ['اسم الطالب', 'الاسم', 'الطالب', 'name'],
  grade_name:       ['المرحلة', 'الصف', 'grade'],
  parent_name:      ['اسم ولي الأمر', 'ولي الأمر', 'الوالد', 'parent_name'],
  parent_email:     ['البريد الإلكتروني', 'الايميل', 'البريد', 'email'],
  parent_phone:     ['رقم الهاتف', 'الهاتف', 'الجوال', 'phone'],
  health_condition: ['الحالة الصحية', 'مرض مزمن', 'ملاحظات صحية', 'health'],
}

function findKey(row, field) {
  const aliases = COLUMN_ALIASES[field]
  const rowKeys = Object.keys(row)
  for (const alias of aliases) {
    const match = rowKeys.find(k => k.trim() === alias)
    if (match) return row[match]
  }
  return ''
}

export default function Students() {
  const [students, setStudents]       = useState([])
  const [grades, setGrades]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('all')
  const [search, setSearch]           = useState('')
  const [acting, setActing]           = useState(null)
  const [gradeFilter, setGradeFilter] = useState('all')
  const [assigning, setAssigning]     = useState(null)

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm]           = useState(emptyAddForm)
  const [addSaving, setAddSaving]       = useState(false)
  const [addError, setAddError]         = useState('')

  // Import Modal
  const [showImportModal, setShowImportModal] = useState(false)
  const [importRows, setImportRows]           = useState([])
  const [importing, setImporting]              = useState(false)
  const [importError, setImportError]          = useState('')
  const [importResult, setImportResult]        = useState(null)

  useEffect(() => { fetchStudents(); fetchGrades() }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/students')
      setStudents(res.data)
    } catch { } finally { setLoading(false) }
  }

  const fetchGrades = async () => {
    try {
      const res = await api.get('/admin/grades')
      setGrades(res.data)
    } catch { }
  }

  const handleApprove = async (id) => {
    setActing(id)
    try { await api.post(`/admin/students/${id}/approve`); fetchStudents() }
    catch { } finally { setActing(null) }
  }

  const handleReject = async (id) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا الطالب؟')) return
    setActing(id)
    try { await api.post(`/admin/students/${id}/reject`); fetchStudents() }
    catch { } finally { setActing(null) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطالب؟')) return
    setActing(id)
    try { await api.delete(`/admin/students/${id}`); fetchStudents() }
    catch { } finally { setActing(null) }
  }

  const handleAssignGrade = async (studentId, gradeId) => {
    if (!gradeId) return
    setAssigning(studentId)
    try {
      await api.post(`/admin/grades/${gradeId}/assign-student`, { student_id: studentId })
      fetchStudents()
    } catch { } finally { setAssigning(null) }
  }

  // ── Add Student ──
  const openAddModal = () => {
    setAddForm(emptyAddForm)
    setAddError('')
    setShowAddModal(true)
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    setAddSaving(true)
    setAddError('')
    try {
      await api.post('/admin/students', addForm)
      setShowAddModal(false)
      fetchStudents()
    } catch (err) {
      setAddError(err.response?.data?.message ?? 'حدث خطأ، حاول مجدداً')
    } finally { setAddSaving(false) }
  }

  // ── Import ──
  const openImportModal = () => {
    setImportRows([])
    setImportError('')
    setImportResult(null)
    setShowImportModal(true)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        const mapped = rawRows.map(row => ({
          name:             findKey(row, 'name'),
          grade_name:       findKey(row, 'grade_name'),
          parent_name:      findKey(row, 'parent_name'),
          parent_email:     findKey(row, 'parent_email'),
          parent_phone:     findKey(row, 'parent_phone'),
          health_condition: findKey(row, 'health_condition'),
        }))

        setImportRows(mapped)
        setImportError('')
      } catch (err) {
        setImportError('تعذر قراءة الملف، تأكد من أنه ملف Excel أو CSV صالح')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleConfirmImport = async () => {
    setImporting(true)
    setImportError('')
    try {
      const res = await api.post('/admin/students/import', { students: importRows })
      setImportResult(res.data.results)
      fetchStudents()
    } catch (err) {
      setImportError(err.response?.data?.message ?? 'حدث خطأ أثناء الاستيراد')
    } finally { setImporting(false) }
  }

  const filtered = students.filter(s => {
    const matchFilter = filter === 'all' || s.status === filter
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchGrade  = gradeFilter === 'all' || s.grade_id === Number(gradeFilter)
    return matchFilter && matchSearch && matchGrade
  })

  const counts = {
    all:      students.length,
    approved: students.filter(s => s.status === 'approved').length,
    pending:  students.filter(s => s.status === 'pending').length,
    rejected: students.filter(s => s.status === 'rejected').length,
  }

  const tabs = [
    { key: 'all',      label: 'الكل'    },
    { key: 'approved', label: 'مقبول'   },
    { key: 'pending',  label: 'انتظار'  },
    { key: 'rejected', label: 'مرفوض'  },
  ]

  const inputStyle = { border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', outline: 'none', textAlign: 'right', background: '#fafafa', width: '100%' }
  const labelStyle = { fontSize: '12px', fontWeight: '500', color: '#374151' }

  return (
    <div style={{ direction: 'rtl' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: 0 }}>الطلاب</h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>إدارة وقبول الطلاب المسجلين</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {counts.pending > 0 && (
            <div style={{ background: '#faeeda', border: '0.5px solid #f5d08a', borderRadius: '10px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-clock" style={{ color: '#854f0b', fontSize: '16px' }} aria-hidden="true" />
              <span style={{ fontSize: '13px', color: '#854f0b', fontWeight: '600' }}>
                {counts.pending} طالب في انتظار الموافقة
              </span>
            </div>
          )}
          <button onClick={openImportModal} style={{ background: 'white', color: '#1a6b5a', border: '0.5px solid #1a6b5a', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-file-spreadsheet" aria-hidden="true" />
            استيراد من ملف
          </button>
          <button onClick={openAddModal} style={{ background: '#1a6b5a', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-plus" aria-hidden="true" />
            إضافة طالب
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'إجمالي الطلاب',   value: counts.all,      bg: '#e6f1fb', color: '#185fa5', icon: 'ti-users'       },
          { label: 'مقبولون',         value: counts.approved, bg: '#e1f5ee', color: '#0f6e56', icon: 'ti-check'       },
          { label: 'في الانتظار',     value: counts.pending,  bg: '#faeeda', color: '#854f0b', icon: 'ti-clock'       },
          { label: 'مرفوضون',         value: counts.rejected, bg: '#fcebeb', color: '#a32d2d', icon: 'ti-x'           },
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

      {/* Tabs + Search */}
      <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
                padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
                background: filter === tab.key ? '#1a6b5a' : '#f3f4f6',
                color: filter === tab.key ? 'white' : '#6b7280',
              }}>
                {tab.label}
                <span style={{ marginRight: '5px', fontSize: '11px', opacity: 0.8 }}>({counts[tab.key]})</span>
              </button>
            ))}
          </div>

          <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}
            style={{ border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', color: '#374151', outline: 'none', background: 'white', cursor: 'pointer' }}>
            <option value="all">كل المراحل</option>
            {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '0.5px solid #e5e7eb', borderRadius: '8px', padding: '7px 12px', minWidth: '220px' }}>
            <i className="ti ti-search" style={{ color: '#9ca3af', fontSize: '15px' }} aria-hidden="true" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="بحث عن طالب..."
              style={{ border: 'none', outline: 'none', fontSize: '13px', textAlign: 'right', background: 'transparent', width: '100%' }} />
          </div>
        </div>

        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1.2fr 1fr 120px', padding: '10px 16px', background: '#f9fafb', fontSize: '11px', color: '#6b7280' }}>
          <span>الطالب</span><span>ولي الأمر</span><span>المرحلة</span><span>الحالة</span><span style={{ textAlign: 'center' }}>إجراءات</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            <i className="ti ti-users-off" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }} aria-hidden="true" />
            لا يوجد طلاب
          </div>
        ) : (
          filtered.map((st, i) => (
            <div key={st.id}
              style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1.2fr 1fr 120px', padding: '12px 16px', alignItems: 'center', borderBottom: i < filtered.length - 1 ? '0.5px solid #f3f4f6' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: color(i), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
                  {initials(st.name)}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#111' }}>{st.name}</p>
                  {st.health_condition && (
                    <p style={{ margin: 0, fontSize: '10px', color: '#a32d2d', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <i className="ti ti-heart-rate-monitor" style={{ fontSize: '11px' }} aria-hidden="true" /> {st.health_condition}
                    </p>
                  )}
                </div>
              </div>

              <span style={{ fontSize: '12px', color: '#6b7280' }}>{st.parent?.name ?? '—'}</span>

              <select
                value={st.grade_id ?? ''}
                disabled={assigning === st.id}
                onChange={e => handleAssignGrade(st.id, e.target.value)}
                style={{ fontSize: '12px', border: '0.5px solid #e5e7eb', borderRadius: '7px', padding: '5px 8px', background: st.grade_id ? '#f0f9f5' : '#fafafa', color: st.grade_id ? '#0f6e56' : '#9ca3af', cursor: 'pointer', outline: 'none' }}>
                <option value="">— غير محدد —</option>
                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>

              <span>
                <span style={{ ...STATUS[st.status], padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
                  {STATUS[st.status]?.label}
                </span>
              </span>

              <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                {st.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(st.id)} disabled={acting === st.id}
                      style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#e1f5ee', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f6e56' }} title="قبول">
                      <i className="ti ti-check" style={{ fontSize: '14px' }} aria-hidden="true" />
                    </button>
                    <button onClick={() => handleReject(st.id)} disabled={acting === st.id}
                      style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#faeeda', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#854f0b' }} title="رفض">
                      <i className="ti ti-x" style={{ fontSize: '14px' }} aria-hidden="true" />
                    </button>
                  </>
                )}
                <button onClick={() => handleDelete(st.id)} disabled={acting === st.id}
                  style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#fcebeb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a32d2d' }} title="حذف">
                  <i className="ti ti-trash" style={{ fontSize: '14px' }} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Add Student Modal ── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '480px', maxWidth: '95vw', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl' }}>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>إضافة طالب جديد</span>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '20px' }}>
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: '20px', direction: 'rtl' }}>
              {addError && (
                <div style={{ background: '#fcebeb', border: '0.5px solid #fca5a5', color: '#a32d2d', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>
                  {addError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>اسم الطالب</label>
                  <input value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} required style={inputStyle} placeholder="عبدالله محمد" />
                </div>

                <div>
                  <label style={labelStyle}>المرحلة</label>
                  <select value={addForm.grade_id} onChange={e => setAddForm({ ...addForm, grade_id: e.target.value })} required style={inputStyle}>
                    <option value="">اختر المرحلة</option>
                    {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>الحالة الصحية (اختياري)</label>
                  <input value={addForm.health_condition} onChange={e => setAddForm({ ...addForm, health_condition: e.target.value })} style={inputStyle} placeholder="مثال: ربو، سكري..." />
                </div>

                <div style={{ borderTop: '0.5px solid #f3f4f6', paddingTop: '12px', marginTop: '4px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 10px' }}>بيانات ولي الأمر</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input value={addForm.parent_name} onChange={e => setAddForm({ ...addForm, parent_name: e.target.value })} required style={inputStyle} placeholder="اسم ولي الأمر" />
                    <input type="email" value={addForm.parent_email} onChange={e => setAddForm({ ...addForm, parent_email: e.target.value })} required style={inputStyle} placeholder="البريد الإلكتروني" />
                    <input value={addForm.parent_phone} onChange={e => setAddForm({ ...addForm, parent_phone: e.target.value })} style={inputStyle} placeholder="رقم الهاتف (اختياري)" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" disabled={addSaving} style={{ background: '#1a6b5a', color: 'white', border: 'none', borderRadius: '9px', padding: '10px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  {addSaving ? 'جاري الحفظ...' : 'إضافة الطالب'}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '9px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Import Modal ── */}
      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '720px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', direction: 'rtl', position: 'sticky', top: 0, background: 'white' }}>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>استيراد طلاب من ملف</span>
              <button onClick={() => setShowImportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '20px' }}>
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>

            <div style={{ padding: '20px', direction: 'rtl' }}>

              {!importResult && (
                <>
                  <div style={{ background: '#f0f9f5', border: '0.5px dashed #1a6b5a', borderRadius: '10px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                    <i className="ti ti-file-upload" style={{ fontSize: '36px', color: '#1a6b5a', display: 'block', marginBottom: '8px' }} aria-hidden="true" />
                    <p style={{ fontSize: '13px', color: '#374151', marginBottom: '12px' }}>
                      اختر ملف Excel أو CSV (مُصدّر من Google Sheets)
                    </p>
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload}
                      style={{ fontSize: '13px' }} />
                  </div>

                  <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '16px' }}>
                    الأعمدة المتوقعة: اسم الطالب، المرحلة، اسم ولي الأمر، البريد الإلكتروني، رقم الهاتف، الحالة الصحية
                  </p>

                  {importError && (
                    <div style={{ background: '#fcebeb', border: '0.5px solid #fca5a5', color: '#a32d2d', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>
                      {importError}
                    </div>
                  )}

                  {importRows.length > 0 && (
                    <>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '10px' }}>
                        معاينة ({importRows.length} طالب)
                      </p>
                      <div style={{ border: '0.5px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px', maxHeight: '260px', overflowY: 'auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 0.8fr', padding: '8px 12px', background: '#f9fafb', fontSize: '11px', color: '#6b7280', position: 'sticky', top: 0 }}>
                          <span>الطالب</span><span>المرحلة</span><span>ولي الأمر</span><span>البريد</span><span>الهاتف</span>
                        </div>
                        {importRows.map((row, i) => (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 0.8fr', padding: '8px 12px', fontSize: '12px', borderTop: '0.5px solid #f3f4f6' }}>
                            <span>{row.name || '—'}</span>
                            <span>{row.grade_name || '—'}</span>
                            <span>{row.parent_name || '—'}</span>
                            <span style={{ fontSize: '11px' }}>{row.parent_email || '—'}</span>
                            <span>{row.parent_phone || '—'}</span>
                          </div>
                        ))}
                      </div>

                      <button onClick={handleConfirmImport} disabled={importing}
                        style={{ background: '#1a6b5a', color: 'white', border: 'none', borderRadius: '9px', padding: '10px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                        {importing ? 'جاري الاستيراد...' : `تأكيد استيراد ${importRows.length} طالب`}
                      </button>
                    </>
                  )}
                </>
              )}

              {importResult && (
                <div>
                  <div style={{ background: '#e1f5ee', border: '0.5px solid #a7d4c4', borderRadius: '10px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
                    <i className="ti ti-circle-check" style={{ fontSize: '32px', color: '#0f6e56', display: 'block', marginBottom: '8px' }} aria-hidden="true" />
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f6e56', margin: 0 }}>
                      تم استيراد {importResult.success} طالب بنجاح
                    </p>
                  </div>

                  {importResult.failed?.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#a32d2d', marginBottom: '8px' }}>
                        فشل استيراد {importResult.failed.length} طالب:
                      </p>
                      {importResult.failed.map((f, i) => (
                        <div key={i} style={{ background: '#fcebeb', borderRadius: '8px', padding: '8px 12px', marginBottom: '6px', fontSize: '12px', color: '#a32d2d' }}>
                          <strong>{f.name}</strong> — {f.reason}
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={() => setShowImportModal(false)}
                    style={{ background: '#1a6b5a', color: 'white', border: 'none', borderRadius: '9px', padding: '10px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    إغلاق
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}