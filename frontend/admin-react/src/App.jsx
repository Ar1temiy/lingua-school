import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider } from './context/AdminAuthContext'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import AdminLayout from './components/Layout/AdminLayout'
import LoginScreen from './screens/LoginScreen'
import DashboardScreen from './screens/DashboardScreen'
import TeachersScreen from './screens/TeachersScreen'
import LanguagesScreen from './screens/LanguagesScreen'
import LessonsScreen from './screens/LessonsScreen'
import SettingsScreen from './screens/SettingsScreen'

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardScreen />} />
                    <Route path="/teachers" element={<TeachersScreen />} />
                    <Route path="/languages" element={<LanguagesScreen />} />
                    <Route path="/lessons" element={<LessonsScreen />} />
                    <Route path="/settings" element={<SettingsScreen />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  )
}
