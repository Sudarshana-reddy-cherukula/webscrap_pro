import { useState, useEffect, useCallback } from 'react'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import SectionHeader from '../components/ui/SectionHeader'
import Tabs from '../components/ui/Tabs'
import Button from '../components/ui/Button'
import { useNotification } from '../hooks/useNotification'
import { analyticsService } from '../services/analyticsService'

const ANALYTICS_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'trends', label: 'Trends' },
  { id: 'frequency', label: 'Frequency' },
  { id: 'keywords', label: 'Keywords' },
]

function AnalyticsPage() {
  const [analyticsTab, setAnalyticsTab] = useState('overview')
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotification()

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true)
      let response

      switch (analyticsTab) {
        case 'overview':
          response = await analyticsService.getOverview()
          break
        case 'trends':
          response = await analyticsService.getTrends('30d')
          break
        case 'frequency':
          response = await analyticsService.getFrequency('all', 10)
          break
        case 'keywords':
          response = await analyticsService.getKeywords(20)
          break
        default:
          response = await analyticsService.getOverview()
      }

      setAnalyticsData(response.data)
    } catch {
      showNotification('Failed to load analytics data', 'error')
      setAnalyticsData(null)
    } finally {
      setLoading(false)
    }
  }, [analyticsTab, showNotification])

  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData])

  const handleExportAnalytics = async () => {
    try {
      const blob = await analyticsService.exportAnalytics('csv', analyticsTab)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${analyticsTab}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showNotification('Analytics exported successfully')
    } catch {
      showNotification('Failed to export analytics', 'error')
    }
  }

  const handleClearAnalytics = async () => {
    if (!window.confirm('Are you sure you want to clear all analytics data?')) {
      return
    }
    try {
      await analyticsService.clearAnalytics()
      setAnalyticsData(null)
      showNotification('Analytics data cleared')
    } catch {
      showNotification('Failed to clear analytics', 'error')
    }
  }

  const renderAnalyticsContent = () => {
    if (loading) {
      return <p>Loading analytics data...</p>
    }

    if (!analyticsData) {
      return (
        <EmptyState
          icon="📊"
          title="No data available"
          text="Scrape data or upload datasets to see charts here."
        />
      )
    }

    return (
      <div className="analytics-content">
        <div className="data-display">
          <pre>{JSON.stringify(analyticsData, null, 2)}</pre>
        </div>
      </div>
    )
  }

  return (
    <section className="container">
      <SectionHeader title="Data Analytics" />
      <Tabs tabs={ANALYTICS_TABS} activeTab={analyticsTab} onChange={setAnalyticsTab} />
      <Card>
        <div className="card-header">
          <h3>Analytics - {analyticsTab}</h3>
          <div className="action-row">
            <Button variant="secondary" size="small" onClick={handleExportAnalytics}>
              Export
            </Button>
            <Button variant="secondary" size="small" onClick={handleClearAnalytics}>
              Clear
            </Button>
          </div>
        </div>
        {renderAnalyticsContent()}
      </Card>
    </section>
  )
}

export default AnalyticsPage
