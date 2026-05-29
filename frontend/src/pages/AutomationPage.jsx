import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, Play, Trash2, Plus, Check, Loader2 } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import EmptyState from '@/components/ui/EmptyState'
import { useNotification } from '@/hooks/useNotification'
import { automationService } from '@/services/automationService'

const NODE_TYPES = [
  { id: 'input', label: 'Input', icon: '📥', color: 'from-cyan-500 to-blue-600' },
  { id: 'scrape', label: 'Scrape', icon: '🕷️', color: 'from-purple-500 to-pink-600' },
  { id: 'clean', label: 'Clean', icon: '🧹', color: 'from-amber-500 to-orange-600' },
  { id: 'analyze', label: 'Analyze', icon: '📊', color: 'from-green-500 to-emerald-600' },
  { id: 'export', label: 'Export', icon: '📤', color: 'from-blue-500 to-indigo-600' },
]

const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-5"
const iconBox = "flex h-9 w-9 items-center justify-center rounded-xl shadow-lg"

function AutomationPage() {
  const { showNotification } = useNotification()
  const [workflows, setWorkflows] = useState([])
  const [loadingWorkflows, setLoadingWorkflows] = useState(true)
  const [activeNodes, setActiveNodes] = useState([])
  const [workflowName, setWorkflowName] = useState('')
  const [creatingWorkflow, setCreatingWorkflow] = useState(false)

  const loadWorkflows = useCallback(async () => {
    try {
      setLoadingWorkflows(true)
      const response = await automationService.getWorkflows(10)
      setWorkflows(response.data.workflows || [])
    } catch {
      showNotification('Failed to load workflows', 'error')
    } finally {
      setLoadingWorkflows(false)
    }
  }, [showNotification])

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { loadWorkflows() }, [loadWorkflows])

  const toggleNode = (type) => {
    const exists = activeNodes.find((n) => n.id === type)
    if (exists) {
      setActiveNodes((prev) => prev.filter((n) => n.id !== type))
      showNotification(`Removed ${type} node`)
    } else {
      setActiveNodes((prev) => [...prev, { id: type }])
      showNotification(`Added ${type} node`)
    }
  }

  const createWorkflow = async () => {
    if (!workflowName.trim()) {
      showNotification('Please enter a workflow name', 'error')
      return
    }
    if (activeNodes.length === 0) {
      showNotification('Please add at least one node', 'error')
      return
    }
    try {
      setCreatingWorkflow(true)
      await automationService.createWorkflow({ name: workflowName, nodes: activeNodes, enabled: true })
      showNotification('Workflow created')
      setWorkflowName('')
      setActiveNodes([])
      loadWorkflows()
    } catch {
      showNotification('Failed to create workflow', 'error')
    } finally {
      setCreatingWorkflow(false)
    }
  }

  const executeWorkflow = async (workflowId) => {
    try {
      await automationService.executeWorkflow(workflowId)
      showNotification('Workflow execution started')
      loadWorkflows()
    } catch {
      showNotification('Failed to execute workflow', 'error')
    }
  }

  const deleteWorkflow = async (workflowId) => {
    if (!window.confirm('Delete this workflow?')) return
    try {
      await automationService.deleteWorkflow(workflowId)
      showNotification('Workflow deleted')
      loadWorkflows()
    } catch {
      showNotification('Failed to delete workflow', 'error')
    }
  }

  return (
    <section className="container space-y-6">
      <SectionHeader title="Workflow Automation" />

      <div className="grid gap-6 xl:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
          <div className="flex items-center gap-3">
            <div className={`${iconBox} bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/20`}>
              <GitBranch size={16} className="text-white" />
            </div>
            <div><h3 className="text-sm font-semibold text-app-fg">Workflow Builder</h3><p className="text-xs text-app-muted">Dragless workflow builder</p></div>
          </div>
          <Input id="workflow-name" placeholder="Enter workflow name" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} />
          <div className="space-y-2">
            <p className={labelClass}>Nodes ({activeNodes.length})</p>
            <div className="min-h-[100px] rounded-xl bg-white/[0.02] border border-dashed border-white/10 p-4">
              {activeNodes.length === 0 ? (
                <EmptyState icon="⚙️" title="No nodes" text="Click + to add nodes" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {activeNodes.map((node, idx) => {
                    const nt = NODE_TYPES.find((n) => n.id === node.id)
                    return (
                      <div key={idx} className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-1.5 text-xs text-app-soft">
                        {nt?.icon} {nt?.label}
                        {idx < activeNodes.length - 1 && <span className="text-app-muted ml-1">→</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <p className={labelClass}>Available Nodes</p>
          <div className="flex flex-wrap gap-2">
            {NODE_TYPES.map((type) => {
              const selected = activeNodes.find((n) => n.id === type.id)
              return (
                <button key={type.id} type="button" onClick={() => toggleNode(type.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition ${
                    selected ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' : 'border-white/10 text-app-muted hover:border-white/20 hover:text-app-soft'
                  }`}
                >
                  {selected ? <Check size={12} /> : <Plus size={12} />} {type.icon} {type.label}
                </button>
              )
            })}
          </div>
          <Button onClick={createWorkflow} disabled={creatingWorkflow} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
            {creatingWorkflow ? <><Loader2 size={14} className="animate-spin mr-1.5" /> Creating...</> : <><GitBranch size={14} className="mr-1.5" /> Create Workflow</>}
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
          <div className="flex items-center gap-3">
            <div className={`${iconBox} bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/20`}>
              <Play size={16} className="text-white" />
            </div>
            <div><h3 className="text-sm font-semibold text-app-fg">Saved Workflows</h3><p className="text-xs text-app-muted">Run and manage your workflows</p></div>
          </div>
          {loadingWorkflows ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-cyan-400" /></div>
          ) : workflows.length === 0 ? (
            <EmptyState icon="📋" title="No workflows yet" text="Create a workflow to see it here" />
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {workflows.map((wf) => (
                <div key={wf.id} className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3 transition hover:bg-white/[0.04]">
                  <div>
                    <p className="text-sm font-medium text-app-soft">{wf.name}</p>
                    <p className="text-xs text-app-muted">{wf.nodes?.length || 0} nodes &middot; {wf.status || 'draft'}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="small" variant="secondary" onClick={() => executeWorkflow(wf.id)}><Play size={12} /></Button>
                    <Button size="small" variant="danger" onClick={() => deleteWorkflow(wf.id)}><Trash2 size={12} /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

const labelClass = "text-xs font-medium text-app-muted uppercase tracking-wider"

export default AutomationPage
