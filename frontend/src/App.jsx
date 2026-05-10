import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/routes/ProtectedRoute'
import { AuthProvider } from './contexts/authContext'
import { ThemeProvider } from './contexts/themeContext'

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ScraperPage = lazy(() => import('./pages/ScraperPage'))
const PdfToolsPage = lazy(() => import('./pages/PdfToolsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const ThemeTest = lazy(() => import('./components/ThemeTest'))

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense
        fallback={
          <div className="min-h-screen grid place-items-center bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/90 px-6 py-8 shadow-2xl shadow-slate-200/40 dark:shadow-slate-950/40">
              Loading app…
            </div>
          </div>
        }
      >
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                    <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/scraper" element={<ScraperPage />} />
            <Route path="/pdf-tools" element={<PdfToolsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </Suspense>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
