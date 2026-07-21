import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Brain, MessageSquare, Search, Copy, AlertTriangle, Loader2, Send, Sparkles, FileText, Clock, Play, Pause, Trash2, Plus, ChevronDown, ChevronRight, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useNotification } from '@/hooks/useNotification'
import { aiService } from '@/services/aiService'
import { scraperService } from '@/services/scraperService'

const cardClass = "rounded-2xl border border-app-line bg-app-elevated/10 backdrop-blur-xl p-6"
const iconBox = "inline-flex rounded-xl bg-gradient-to-br p-2"

const TABS = [
  { id: 'chat', label: 'Chat with Data', icon: MessageSquare },
  { id: 'search', label: 'Semantic Search', icon: Search },
  { id: 'classify', label: 'Classify', icon: Brain },
  { id: 'schedule', label: 'Scheduler', icon: Clock },
]

function ChatTab() {
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const { showNotification } = useNotification()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadSessions()
    loadJobs()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadSessions = async () => {
    try {
      const res = await aiService.getChatSessions()
      setSessions(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Failed to load chat sessions')
    }
  }

  const loadJobs = async () => {
    try {
      const res = await scraperService.getUserJobs(1, 20)
      setJobs(res.data?.data?.jobs || res.data?.jobs || [])
    } catch (err) {
      console.error('Failed to load jobs')
    }
  }

  const createSession = async (jobId) => {
    try {
      setLoading(true)
      const res = await aiService.createChatSession(jobId)
      const session = res.data?.data || res.data
      setSessions(prev => [session, ...prev])
      setActiveSession(session)
      setMessages([])
      setSelectedJob(jobId)
    } catch (err) {
      showNotification(err?.message || 'Failed to create chat session', 'error')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeSession) return

    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await aiService.sendMessage(activeSession._id, input)
      const data = res.data?.data || res.data
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, timestamp: new Date().toISOString() }])
    } catch (err) {
      showNotification(err?.message || 'Failed to send message', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadSessionHistory = async (session) => {
    try {
      const res = await aiService.getChatHistory(session._id)
      const data = res.data?.data || res.data
      setActiveSession(session)
      setMessages(data.messages || [])
    } catch (err) {
      showNotification('Failed to load chat history', 'error')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
      <div className={`${cardClass} overflow-y-auto`}>
        <h3 className="text-sm font-medium text-app-fg mb-3">Sessions</h3>
        <Button size="sm" className="w-full mb-3" onClick={() => setSelectedJob(null)}>
          <Plus size={14} className="mr-1.5" /> New Chat
        </Button>
        {sessions.map(session => (
          <button
            key={session._id}
            onClick={() => loadSessionHistory(session)}
            className={`w-full text-left p-2 rounded-lg text-xs transition mb-1 ${
              activeSession?._id === session._id ? 'bg-cyan-500/15 text-cyan-300' : 'text-app-muted hover:bg-app-surface'
            }`}
          >
            <p className="truncate">{session.title}</p>
            <p className="text-[10px] opacity-60">{session.messageCount} messages</p>
          </button>
        ))}
      </div>

      <div className={`${cardClass} lg:col-span-3 flex flex-col`}>
        {!selectedJob && !activeSession ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <MessageSquare size={40} className="text-app-muted mb-4" />
            <p className="text-sm text-app-muted mb-4">Select a job to chat with its content</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {jobs.slice(0, 6).map(job => (
                <button
                  key={job._id}
                  onClick={() => createSession(job._id)}
                  className="text-left p-3 rounded-lg border border-app-line bg-app-surface hover:bg-app-surface transition text-xs"
                >
                  <p className="text-app-fg font-medium truncate">{job.results?.metadata?.title || job.targetUrl}</p>
                  <p className="text-app-muted mt-1 truncate">{job.targetUrl}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.length > 0 && (
              <div className="flex items-center justify-end mb-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = messages.map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`).join('\n\n')
                    const blob = new Blob([text], { type: 'text/plain' })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a'); a.href = url; a.download = `chat-${activeSession?.title || 'export'}.txt`; a.click()
                    window.URL.revokeObjectURL(url)
                  }}
                  className="rounded-lg border border-app-line p-1.5 text-app-muted hover:bg-app-elevated/15 hover:text-app-soft transition"
                  title="Download chat"
                >
                  <Download size={12} />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles size={32} className="mx-auto text-cyan-400 mb-2" />
                  <p className="text-sm text-app-muted">Ask anything about this content</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/20 text-cyan-100'
                      : 'bg-app-surface text-app-soft'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about the scraped content..."
                className="flex-1"
                disabled={loading}
              />
              <Button onClick={sendMessage} disabled={loading || !input.trim()}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SearchTab() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotification()

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await aiService.semanticSearch(query, { limit: 10, threshold: 0.6 })
      setResults(res.data?.data?.results || [])
    } catch (err) {
      showNotification(err?.message || 'Search failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for similar content..."
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-app-muted">{results.length} results found</p>
            <button
              type="button"
              onClick={() => {
                const csv = 'Title,URL,Similarity,Content\n' + results.map(r => 
                  `"${(r.metadata?.title || '').replace(/"/g, '""')}","${r.metadata?.url || ''}","${(r.similarity * 100).toFixed(0)}%","${(r.content || '').replace(/"/g, '""')}"`
                ).join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a'); a.href = url; a.download = `search-results.csv`; a.click()
                window.URL.revokeObjectURL(url)
              }}
              className="rounded-lg border border-app-line p-1.5 text-app-muted hover:bg-app-elevated/15 hover:text-app-soft transition"
              title="Export results"
            >
              <Download size={12} />
            </button>
          </div>
          {results.map((result, i) => (
            <motion.div
              key={result._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cardClass}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-app-fg">{result.metadata?.title || 'Untitled'}</h4>
                  <p className="text-xs text-app-muted mt-1 truncate">{result.metadata?.url}</p>
                </div>
                <Badge className="bg-cyan-500/15 text-cyan-300">
                  {(result.similarity * 100).toFixed(0)}% match
                </Badge>
              </div>
              {result.content && (
                <p className="text-xs text-app-muted mt-3 line-clamp-3">{result.content}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {results.length === 0 && !loading && (
        <div className="text-center py-12">
          <Search size={40} className="mx-auto text-app-muted mb-4" />
          <p className="text-sm text-app-muted">Enter a query to find similar content</p>
        </div>
      )}
    </div>
  )
}

function ClassifyTab() {
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [classification, setClassification] = useState(null)
  const [keywords, setKeywords] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotification()

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const res = await scraperService.getUserJobs(1, 50)
      setJobs(res.data?.data?.jobs || res.data?.jobs || [])
    } catch (err) {
      console.error('Failed to load jobs')
    }
  }

  const analyzeJob = async (jobId) => {
    setSelectedJob(jobId)
    setLoading(true)
    setClassification(null)
    setKeywords(null)
    setSummary(null)

    try {
      const [classRes, kwRes, sumRes] = await Promise.all([
        aiService.classify(jobId),
        aiService.extractKeywords(jobId, { maxKeywords: 10 }),
        aiService.summarize(jobId, { style: 'concise' }),
      ])
      setClassification(classRes.data?.data || classRes.data)
      setKeywords(kwRes.data?.data || kwRes.data)
      setSummary(sumRes.data?.data || sumRes.data)
    } catch (err) {
      showNotification('Analysis failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {jobs.map(job => (
          <button
            key={job._id}
            onClick={() => analyzeJob(job._id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedJob === job._id
                ? 'border-cyan-500/50 bg-cyan-500/10'
                : 'border-app-line bg-app-surface hover:bg-app-surface'
            }`}
          >
            <p className="text-sm text-app-fg font-medium truncate">{job.results?.metadata?.title || job.targetUrl}</p>
            <p className="text-xs text-app-muted mt-1 truncate">{job.targetUrl}</p>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-cyan-400" />
          <span className="ml-2 text-sm text-app-muted">Analyzing content...</span>
        </div>
      )}

      {!loading && classification && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                const report = `Classification Report\n\nCategory: ${classification.category}\nConfidence: ${(classification.confidence * 100).toFixed(0)}%\n\nKeywords:\n${classification.keywords?.map(k => `- ${k.keyword} (${(k.relevance * 100).toFixed(0)}%)`).join('\n') || 'None'}\n\nSummary:\n${classification.summary || 'N/A'}`
                const blob = new Blob([report], { type: 'text/plain' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a'); a.href = url; a.download = `classification-${classification.category}.txt`; a.click()
                window.URL.revokeObjectURL(url)
              }}
              className="rounded-lg border border-app-line p-1.5 text-app-muted hover:bg-app-elevated/15 hover:text-app-soft transition"
              title="Download report"
            >
              <Download size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-purple-400" />
              <h3 className="text-sm font-medium text-app-fg">Classification</h3>
            </div>
            <Badge className="bg-purple-500/15 text-purple-300 mb-2">{classification.category}</Badge>
            <p className="text-xs text-app-muted">Confidence: {(classification.confidence * 100).toFixed(0)}%</p>
            {classification.subcategories?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {classification.subcategories.map((sub, i) => (
                  <Badge key={i} className="bg-app-surface text-app-soft text-[10px]">{sub}</Badge>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-cyan-400" />
              <h3 className="text-sm font-medium text-app-fg">Summary</h3>
            </div>
            <p className="text-xs text-app-soft leading-relaxed">{summary?.summary}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass}>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-green-400" />
              <h3 className="text-sm font-medium text-app-fg">Keywords</h3>
            </div>
            <div className="flex flex-wrap gap-1">
              {keywords?.keywords?.map((kw, i) => (
                <Badge key={i} className="bg-green-500/15 text-green-300 text-[10px]">{kw.keyword}</Badge>
              ))}
            </div>
          </motion.div>
        </div>
        </div>
      )}
    </div>
  )
}

function ScheduleTab() {
  const [jobs, setJobs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', url: '', cronExpression: '0 * * * *', enabled: true })
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotification()

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const res = await aiService.getScheduledJobs()
      setJobs(res.data?.data || [])
    } catch (err) {
      console.error('Failed to load scheduled jobs')
    }
  }

  const createJob = async () => {
    if (!form.name || !form.url) {
      showNotification('Name and URL are required', 'error')
      return
    }
    setLoading(true)
    try {
      await aiService.createScheduledJob(form)
      setShowForm(false)
      setForm({ name: '', url: '', cronExpression: '0 * * * *', enabled: true })
      loadJobs()
      showNotification('Scheduled job created')
    } catch (err) {
      showNotification(err?.message || 'Failed to create job', 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleJob = async (jobId) => {
    try {
      await aiService.toggleScheduledJob(jobId)
      loadJobs()
    } catch (err) {
      showNotification('Failed to toggle job', 'error')
    }
  }

  const runNow = async (jobId) => {
    try {
      await aiService.runScheduledJobNow(jobId)
      showNotification('Job executed')
    } catch (err) {
      showNotification('Failed to run job', 'error')
    }
  }

  const deleteJob = async (jobId) => {
    try {
      await aiService.deleteScheduledJob(jobId)
      loadJobs()
      showNotification('Job deleted')
    } catch (err) {
      showNotification('Failed to delete job', 'error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-app-fg">Scheduled Jobs</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} className="mr-1.5" /> New Schedule
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-app-muted mb-1">Name</label>
              <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="My Schedule" />
            </div>
            <div>
              <label className="block text-xs text-app-muted mb-1">URL</label>
              <Input value={form.url} onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))} placeholder="https://example.com" />
            </div>
            <div>
              <label className="block text-xs text-app-muted mb-1">Cron Expression</label>
              <Input value={form.cronExpression} onChange={(e) => setForm(prev => ({ ...prev, cronExpression: e.target.value }))} placeholder="0 * * * *" />
            </div>
            <div className="flex items-end">
              <Button onClick={createJob} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-app-muted mt-2">Common: <code>0 * * * *</code> (hourly), <code>0 9 * * *</code> (daily at 9am), <code>0 9 * * 1</code> (weekly Monday 9am)</p>
        </motion.div>
      )}

      <div className="space-y-2">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={40} className="mx-auto text-app-muted mb-4" />
            <p className="text-sm text-app-muted">No scheduled jobs yet</p>
          </div>
        ) : (
          jobs.map((job, i) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${cardClass} flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <Badge className={job.enabled ? 'bg-green-500/15 text-green-300' : 'bg-app-surface text-app-muted'}>
                  {job.enabled ? 'Active' : 'Paused'}
                </Badge>
                <div>
                  <p className="text-sm text-app-fg font-medium">{job.name}</p>
                  <p className="text-xs text-app-muted">{job.url}</p>
                  <p className="text-[10px] text-app-muted">Cron: {job.cronExpression} | Runs: {job.runCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => runNow(job._id)} title="Run now">
                  <Play size={14} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => toggleJob(job._id)} title={job.enabled ? 'Pause' : 'Enable'}>
                  {job.enabled ? <Pause size={14} /> : <Play size={14} />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteJob(job._id)} title="Delete">
                  <Trash2 size={14} />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

function AIDashboardPage() {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-app-fg">AI Dashboard</h1>
        <p className="mt-1 text-sm text-app-muted">Intelligent features powered by AI</p>
      </div>

      <div className="flex gap-1 rounded-xl border border-app-line bg-app-elevated/10 p-1 backdrop-blur-xl overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.id ? 'bg-cyan-500/15 text-cyan-300' : 'text-app-muted hover:text-app-soft'
              }`}
            ><Icon size={14} /> {tab.label}</button>
          )
        })}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'search' && <SearchTab />}
        {activeTab === 'classify' && <ClassifyTab />}
        {activeTab === 'schedule' && <ScheduleTab />}
      </motion.div>
    </div>
  )
}

export default AIDashboardPage
