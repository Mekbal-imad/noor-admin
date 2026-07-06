import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import DashboardLayout from './components/DashboardLayout'
import Home from './pages/Home'
import Teachers from './pages/teachers/Teachers'
import Students from './pages/students/Students'
import Grades from './pages/grades/Grades'
import GradeDetail from './pages/grades/GradeDetail'
import Exams from './pages/exams/Exams'
import Stats from './pages/Stats'
import Notifications from './pages/Notifications'

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard"     element={<Home />} />
        <Route path="teachers"      element={<Teachers />} />
        <Route path="students"      element={<Students />} />
        <Route path="grades"           element={<Grades />} />
        <Route path="grades/:id"       element={<GradeDetail />} />
        <Route path="exams"         element={<Exams />} />
        <Route path="stats"         element={<Stats />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}