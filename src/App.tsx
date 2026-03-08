import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ChatLayout } from './components/ChatLayout'
import { BetaBanner } from './components/BetaBanner'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'

function ThemedApp() {
  const { theme } = useApp()
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <>
      <BetaBanner />
      <ChatLayout />
    </>
  )
}

function AppWrapper() {
  return (
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
