import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/routes/ProtectedRoute'
import AdminRoute from './components/routes/AdminRoute'

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const VerifyOtpPage = lazy(() => import('./pages/VerifyOtpPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ScraperPage = lazy(() => import('./pages/ScraperPage'))
const PdfToolsPage = lazy(() => import('./pages/PdfToolsPage'))
const UploadsPage = lazy(() => import('./pages/UploadsPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const ExportPage = lazy(() => import('./pages/ExportPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const AIDashboardPage = lazy(() => import('./pages/AIDashboardPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const DocsPage = lazy(() => import('./pages/DocsPage'))
const WorkflowsPage = lazy(() => import('./pages/WorkflowsPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const loadingFallback = (
  <div className="flex min-h-screen items-center justify-center bg-app-bg">
    <div className="flex items-center gap-3 rounded-2xl border border-app-line bg-app-surface px-6 py-4">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      <span className="text-sm text-app-muted">Loading...</span>
    </div>
  </div>
)

function App() {
  return (
    <Suspense fallback={loadingFallback}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
          <Route path="/dashboard/ai" element={<AIDashboardPage />} />
          <Route path="/dashboard/scraping" element={<ScraperPage />} />
          <Route path="/dashboard/pdf-tools" element={<PdfToolsPage />} />
          <Route path="/dashboard/uploads" element={<UploadsPage />} />
          <Route path="/dashboard/history" element={<HistoryPage />} />
          <Route path="/dashboard/exports" element={<ExportPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
          <Route path="/dashboard/workflows" element={<WorkflowsPage />} />
          <Route path="/dashboard/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/scraper" element={<ScraperPage />} />
          <Route path="/pdf-tools" element={<PdfToolsPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/ai" element={<AIDashboardPage />} />
          <Route path="/workflows" element={<WorkflowsPage />} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
