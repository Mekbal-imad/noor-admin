import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }               = useAuth()
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ fontFamily: "'Changa', sans-serif" }}>

      {/* Left — Teal Side */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-10 relative"
        style={{ backgroundColor: '#2a7c6f' }}>

        {/* Logo + Title */}
        <div className="mb-10 text-center">
          <img src="/logo.png" alt="نور" className="w-28 h-28 object-contain mx-auto mb-4 drop-shadow-xl" />
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Changa', sans-serif" }}>
            نظام نور
          </h1>
          <p className="text-white/70 text-sm mt-1">إدارة مدارس تحفيظ القرآن الكريم</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">تسجيل الدخول</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-3 py-3 bg-green-50 border-l border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 text-right focus:outline-none text-sm"
                  placeholder="ادخل البريد الإلكتروني"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-3 py-3 bg-green-50 border-l border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="flex-1 px-4 py-3 text-right focus:outline-none text-sm"
                  placeholder="ادخل كلمة المرور"
                  required
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-bold text-base transition-all mt-2"
              style={{ backgroundColor: loading ? '#9ca3af' : '#b8962e' }}
            >
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>
      </div>

      {/* Right — Registration Picture Side */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden">
        <img 
          src="/registration.jpg" 
          alt="Registration" 
          className="w-full h-full object-cover"
        />
      </div>

    </div>
  )
}