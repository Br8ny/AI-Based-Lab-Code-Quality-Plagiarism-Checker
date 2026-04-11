import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProcessingPage from './pages/ProcessingPage'
import DashboardPage from './pages/DashboardPage'
import HeatmapPage from './pages/HeatmapPage'
import StudentDetailPage from './pages/StudentDetailPage'
import ComparisonPage from './pages/ComparisonPage'
import ReportsPage from './pages/ReportsPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />
        <Route path="/processing" element={<ProtectedRoute><ProcessingPage /></ProtectedRoute>} />
        <Route path="/dashboard"  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/heatmap"    element={<ProtectedRoute><HeatmapPage /></ProtectedRoute>} />
        <Route path="/student/:name" element={<ProtectedRoute><StudentDetailPage /></ProtectedRoute>} />
        <Route path="/compare/:studentA/:studentB" element={<ProtectedRoute><ComparisonPage /></ProtectedRoute>} />
        <Route path="/reports"    element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

