import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TeacherAuthProvider } from './context/TeacherAuthContext'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import TeacherLayout from './components/Layout/TeacherLayout'
import LoginScreen from './screens/LoginScreen'
import DashboardScreen from './screens/DashboardScreen'

export default function App() {
  return (
    <TeacherAuthProvider>
      <BrowserRouter basename="/teacher">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <TeacherLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardScreen />} />
                  </Routes>
                </TeacherLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TeacherAuthProvider>
  )
}
