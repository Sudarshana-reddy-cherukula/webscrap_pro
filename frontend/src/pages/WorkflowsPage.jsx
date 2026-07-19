import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Workflow, Plus, Play, Pause, Trash2, ChevronRight, ChevronDown,
  Loader2, Clock, CheckCircle2, XCircle, GripVertical, Settings,
  Globe, FileText, Filter, Download, Send, Timer, ArrowRight,
  History, BarChart3, Zap, AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useNotification } from '@/hooks/useNotification'
import { workflowService } from '@/services/workflowService'

const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6"

const STEP_TYPES = [
  { type: 'scrape', label: 'Scrape URL', icon: Globe, color: 'cyan' },
  { type: 'transform', label: 'Transform', icon: FileText, color: 'purple' },
  { type: 'condition', label: 'Condition', icon: Filter, color: 'amber' },
  { type: 'export', label: 'Export', icon: Download, color: 'green' },
  { type: 'webhook', label: 'Webhook', icon: Send, color: 'rose' },
  { type: 'delay', label: 'Delay', icon: Timer, color: 'blue' },
]

const STEP_COLORS = {
  cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  green: 'bg-green-500/15 text-green-300 border-green-500/30',
  rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  blue: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
}

function StepEditor({ step, index, onChange, onRemove }) {
  const stepType = STEP_TYPES.find(s => s.type === step.type)
  const [expanded, setExpanded] = useState(false)

  const updateConfig = (key, value) => {
    onChange(index, { ...step, config: { ...step.config, [key]: value } })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${cardClass} !p-4`}
    >
      <div className="flex items-center gap-3">
        <GripVertical size={14} className="text-app-muted cursor-move" />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Badge className={STEP_COLORS[stepType?.color || 'cyan']}>{step.type}</Badge>
          <input
            type="text"
            value={step.name}
            onChange={(e) => onChange(index, { ...step, name: e.target.value })}
            className="flex-1 bg-transparent text-sm text-app-fg outline-none min-w-0"
            placeholder="Step name"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onRemove(index)} className="text-red-400 hover:text-red-300">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
              {(step.type === 'scrape') && (
                <>
                  <div>
                    <label className="block text-xs text-app-muted mb-1">URL</label>
                    <Input value={step.config.url || ''} onChange={(e) => updateConfig('url', e.target.value)} placeholder="https://example.com" />
                  </div>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 text-xs text-app-muted">
                      <input type="checkbox" checked={step.config.extractLinks || false} onChange={(e) => updateConfig('extractLinks', e.target.checked)} className="rounded" />
                      Links
                    </label>
                    <label className="flex items-center gap-2 text-xs text-app-muted">
                      <input type="checkbox" checked={step.config.extractImages || false} onChange={(e) => updateConfig('extractImages', e.target.checked)} className="rounded" />
                      Images
                    </label>
                  </div>
                </>
              )}
              {step.type === 'transform' && (
                <>
                  <div>
                    <label className="block text-xs text-app-muted mb-1">Operation</label>
                    <select value={step.config.operation || 'extractText'} onChange={(e) => updateConfig('operation', e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-app-fg outline-none">
                      <option value="extractText">Extract Text</option>
                      <option value="summarize">Summarize (AI)</option>
                      <option value="extractKeywords">Extract Keywords (AI)</option>
                    </select>
                  </div>
                  {step.config.operation === 'summarize' && (
                    <div>
                      <label className="block text-xs text-app-muted mb-1">Style</label>
                      <select value={step.config.style || 'concise'} onChange={(e) => updateConfig('style', e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-app-fg outline-none">
                        <option value="concise">Concise</option>
                        <option value="detailed">Detailed</option>
                        <option value="bullet">Bullet Points</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>
                  )}
                </>
              )}
              {step.type === 'condition' && (
                <div className="grid grid-cols-3 gap-2">
                  <Input value={step.config.field || ''} onChange={(e) => updateConfig('field', e.target.value)} placeholder="Field path" />
                  <select value={step.config.operator || 'contains'} onChange={(e) => updateConfig('operator', e.target.value)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-app-fg outline-none">
                    <option value="contains">Contains</option>
                    <option value="notContains">Not Contains</option>
                    <option value="equals">Equals</option>
                    <option value="notEmpty">Not Empty</option>
                  </select>
                  <Input value={step.config.value || ''} onChange={(e) => updateConfig('value', e.target.value)} placeholder="Value" />
                </div>
              )}
              {step.type === 'webhook' && (
                <Input value={step.config.url || ''} onChange={(e) => updateConfig('url', e.target.value)} placeholder="Webhook URL" />
              )}
              {step.type === 'delay' && (
                <div>
                  <label className="block text-xs text-app-muted mb-1">Duration (ms, max 60000)</label>
                  <Input type="number" value={step.config.duration || 1000} onChange={(e) => updateConfig('duration', parseInt(e.target.value) || 1000)} />
                </div>
              )}
              <div className="flex gap-3">
                <div>
                  <label className="block text-xs text-app-muted mb-1">On Error</label>
                  <select value={step.onError || 'stop'} onChange={(e) => onChange(index, { ...step, onError: e.target.value })}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-app-fg outline-none">
                    <option value="stop">Stop</option>
                    <option value="continue">Continue</option>
                    <option value="retry">Retry</option>
                  </select>
                </div>
                {(step.onError === 'retry') && (
                  <div>
                    <label className="block text-xs text-app-muted mb-1">Retries</label>
                    <Input type="number" value={step.retryCount || 3} onChange={(e) => onChange(index, { ...step, retryCount: parseInt(e.target.value) || 3 })} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function WorkflowBuilder({ workflow, onSave, onClose }) {
  const [name, setName] = useState(workflow?.name || '')
  const [description, setDescription] = useState(workflow?.description || '')
  const [steps, setSteps] = useState(workflow?.steps || [])
  const [saving, setSaving] = useState(false)
  const { showNotification } = useNotification()

  const addStep = (type) => {
    const stepType = STEP_TYPES.find(s => s.type === type)
    setSteps([...steps, { type, name: stepType?.label || type, config: {}, enabled: true, onError: 'stop', retryCount: 3 }])
  }

  const updateStep = (index, updated) => {
    const newSteps = [...steps]
    newSteps[index] = updated
    setSteps(newSteps)
  }

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const save = async () => {
    if (!name.trim()) {
      showNotification('Name is required', 'error')
      return
    }
    setSaving(true)
    try {
      if (workflow?._id) {
        await workflowService.updateWorkflow(workflow._id, { name, description, steps })
      } else {
        await workflowService.createWorkflow({ name, description, steps })
      }
      showNotification('Workflow saved')
      onSave()
    } catch (error) {
      showNotification(error?.response?.data?.message || 'Failed to save workflow', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workflow name" />
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" />
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => (
          <StepEditor key={i} step={step} index={i} onChange={updateStep} onRemove={removeStep} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {STEP_TYPES.map(st => {
          const Icon = st.icon
          return (
            <Button key={st.type} size="sm" variant="outline" onClick={() => addStep(st.type)}>
              <Icon size={12} className="mr-1" /> {st.label}
            </Button>
          )
        })}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
          {workflow?._id ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  )
}

function RunHistory({ workflowId, onClose }) {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await workflowService.getRunHistory(workflowId)
        if (active) setRuns(res.data?.data?.runs || [])
      } catch {
        if (active) showNotification('Failed to load run history', 'error')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const statusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle2 size={14} className="text-green-400" />
      case 'failed': return <XCircle size={14} className="text-red-400" />
      case 'running': return <Loader2 size={14} className="text-cyan-400 animate-spin" />
      case 'cancelled': return <AlertTriangle size={14} className="text-amber-400" />
      default: return <Clock size={14} className="text-app-muted" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-app-fg">Run History</h3>
        <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-cyan-400" />
        </div>
      ) : runs.length === 0 ? (
        <div className="text-center py-8">
          <History size={32} className="mx-auto text-app-muted mb-2" />
          <p className="text-sm text-app-muted">No runs yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {runs.map(run => (
            <div key={run._id} className={`${cardClass} !p-3`}>
              <div className="flex items-center gap-3">
                {statusIcon(run.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-app-fg">
                    {new Date(run.createdAt).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-app-muted">
                    {run.stepsRun?.filter(s => s.status === 'success').length || 0}/{run.stepsRun?.length || 0} steps
                    {run.duration ? ` - ${(run.duration / 1000).toFixed(1)}s` : ''}
                  </p>
                </div>
                <Badge className={run.status === 'success' ? 'bg-green-500/15 text-green-300' : run.status === 'failed' ? 'bg-red-500/15 text-red-300' : 'bg-white/10 text-app-muted'}>
                  {run.status}
                </Badge>
              </div>
              {run.stepsRun?.map((step, i) => (
                <div key={i} className="flex items-center gap-2 ml-6 mt-1 text-[10px] text-app-muted">
                  <span className={step.status === 'success' ? 'text-green-400' : step.status === 'failed' ? 'text-red-400' : 'text-app-muted'}>
                    {step.status === 'success' ? '●' : step.status === 'failed' ? '●' : step.status === 'skipped' ? '○' : '○'}
                  </span>
                  <span>{step.stepName}</span>
                  <span className="opacity-60">{step.stepType}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState(null)
  const [showRuns, setShowRuns] = useState(null)
  const { showNotification } = useNotification()

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [wfRes, statsRes] = await Promise.all([
          workflowService.getWorkflows(),
          workflowService.getStats(),
        ])
        if (active) {
          setWorkflows(wfRes.data?.data?.workflows || [])
          setStats(statsRes.data?.data || null)
        }
      } catch {
        if (active) showNotification('Failed to load workflows', 'error')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadWorkflows = async () => {
    try {
      const [wfRes, statsRes] = await Promise.all([
        workflowService.getWorkflows(),
        workflowService.getStats(),
      ])
      setWorkflows(wfRes.data?.data?.workflows || [])
      setStats(statsRes.data?.data || null)
    } catch {
      showNotification('Failed to load workflows', 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleWorkflow = async (id) => {
    try {
      await workflowService.toggleWorkflow(id)
      loadWorkflows()
    } catch {
      showNotification('Failed to toggle workflow', 'error')
    }
  }

  const executeWorkflow = async (id) => {
    try {
      await workflowService.executeWorkflow(id)
      showNotification('Workflow executed')
      loadWorkflows()
    } catch {
      showNotification('Failed to execute workflow', 'error')
    }
  }

  const deleteWorkflow = async (id) => {
    try {
      await workflowService.deleteWorkflow(id)
      showNotification('Workflow deleted')
      loadWorkflows()
    } catch {
      showNotification('Failed to delete workflow', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-cyan-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-app-fg">Workflows</h1>
          <p className="mt-1 text-sm text-app-muted">Automate multi-step scraping pipelines</p>
        </div>
        <Button onClick={() => { setEditingWorkflow(null); setShowBuilder(true) }}>
          <Plus size={14} className="mr-1.5" /> New Workflow
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Workflows', value: stats.totalWorkflows, icon: Workflow, color: 'text-cyan-400' },
            { label: 'Active', value: stats.activeWorkflows, icon: Zap, color: 'text-green-400' },
            { label: 'Total Runs', value: stats.totalRuns, icon: Play, color: 'text-purple-400' },
            { label: 'Success Rate', value: `${stats.successRate}%`, icon: BarChart3, color: 'text-amber-400' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`${cardClass} !p-4`}>
              <stat.icon size={16} className={`${stat.color} mb-2`} />
              <p className="text-xl font-bold text-app-fg">{stat.value}</p>
              <p className="text-[10px] text-app-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {showBuilder && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
          <h3 className="text-sm font-medium text-app-fg mb-4">
            {editingWorkflow ? 'Edit Workflow' : 'New Workflow'}
          </h3>
          <WorkflowBuilder
            workflow={editingWorkflow}
            onSave={() => { setShowBuilder(false); setEditingWorkflow(null); loadWorkflows() }}
            onClose={() => { setShowBuilder(false); setEditingWorkflow(null) }}
          />
        </motion.div>
      )}

      {showRuns && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
          <RunHistory workflowId={showRuns} onClose={() => setShowRuns(null)} />
        </motion.div>
      )}

      <div className="space-y-3">
        {workflows.length === 0 ? (
          <div className={`${cardClass} text-center py-12`}>
            <Workflow size={40} className="mx-auto text-app-muted mb-4" />
            <p className="text-sm text-app-muted mb-4">No workflows yet</p>
            <Button onClick={() => setShowBuilder(true)}>
              <Plus size={14} className="mr-1.5" /> Create your first workflow
            </Button>
          </div>
        ) : (
          workflows.map((wf, i) => (
            <motion.div
              key={wf._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${cardClass} !p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Badge className={wf.enabled ? 'bg-green-500/15 text-green-300' : 'bg-white/10 text-app-muted'}>
                    {wf.enabled ? 'Active' : 'Paused'}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-app-fg truncate">{wf.name}</p>
                    <p className="text-xs text-app-muted truncate">
                      {wf.description || `${wf.stepCount || wf.steps?.length || 0} steps`}
                      {wf.lastRun ? ` - Last run: ${new Date(wf.lastRun).toLocaleDateString()}` : ''}
                      {` - Runs: ${wf.runCount || 0}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => executeWorkflow(wf._id)} title="Run now">
                    <Play size={14} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setShowRuns(wf._id)} title="Run history">
                    <History size={14} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditingWorkflow(wf); setShowBuilder(true) }} title="Edit">
                    <Settings size={14} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => toggleWorkflow(wf._id)} title={wf.enabled ? 'Pause' : 'Enable'}>
                    {wf.enabled ? <Pause size={14} /> : <Play size={14} />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteWorkflow(wf._id)} title="Delete" className="text-red-400 hover:text-red-300">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {wf.steps?.map((step, si) => {
                  const st = STEP_TYPES.find(s => s.type === step.type)
                  return (
                    <div key={si} className="flex items-center gap-1">
                      <Badge className={`${STEP_COLORS[st?.color || 'cyan']} text-[10px]`}>{step.name || step.type}</Badge>
                      {si < (wf.steps?.length || 0) - 1 && <ArrowRight size={10} className="text-app-muted" />}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
