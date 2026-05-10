import { useState, useEffect, useCallback } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SectionHeader from '../components/ui/SectionHeader'
import { useNotification } from '../hooks/useNotification'
import { automationService } from '../services/automationService'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'

const NODE_TYPES = [
  { id: 'input', label: 'Input', icon: '📥' },
  { id: 'scrape', label: 'Scrape', icon: '🕷️' },
  { id: 'clean', label: 'Clean', icon: '🧹' },
  { id: 'analyze', label: 'Analyze', icon: '📊' },
  { id: 'export', label: 'Export', icon: '📤' },
]

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

  useEffect(() => {
    loadWorkflows()
  }, [loadWorkflows])

  const toggleNode = (type) => {
    const exists = activeNodes.find((n) => n.id === type)
    if (exists) {
      setActiveNodes((prev) => prev.filter((n) => n.id !== type))
      showNotification(`Removed ${type} node from workflow`)
    } else {
      setActiveNodes((prev) => [...prev, { id: type }])
      showNotification(`Added ${type} node to workflow`)
    }
  }

  const createWorkflow = async () => {
    if (!workflowName.trim()) {
      showNotification('Please enter a workflow name', 'error')
      return
    }

    if (activeNodes.length === 0) {
      showNotification('Please add at least one node to the workflow', 'error')
      return
    }

    try {
      setCreatingWorkflow(true)
      const workflow = {
        name: workflowName,
        nodes: activeNodes,
        enabled: true,
      }
      await automationService.createWorkflow(workflow)
      showNotification('Workflow created successfully')
      setWorkflowName('')
      setActiveNodes([])
      loadWorkflows()
    } catch (error) {
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
    } catch (error) {
      showNotification('Failed to execute workflow', 'error')
    }
  }

  const deleteWorkflow = async (workflowId) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) {
      return
    }
    try {
      await automationService.deleteWorkflow(workflowId)
      showNotification('Workflow deleted')
      loadWorkflows()
    } catch (error) {
      showNotification('Failed to delete workflow', 'error')
    }
  }

  return (
    <section className="container">
      <SectionHeader title="Workflow Automation" />
      <div className="grid-2">
        <Card>
          <h3>Workflow Builder</h3>
          <Input
            id="workflow-name"
            placeholder="Enter workflow name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
          />
          <div className="node-builder">
            <p className="text-small">Selected Nodes ({activeNodes.length})</p>
            <div className="node-display">
              {activeNodes.length === 0 ? (
                <EmptyState
                  icon="⚙️"
                  title="No nodes selected"
                  text="Click + to add workflow nodes"
                />
              ) : (
                <div className="node-flow">
                  {activeNodes.map((node, idx) => (
                    <div key={idx} className="node">
                      {NODE_TYPES.find((n) => n.id === node.id)?.icon} {node.id}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-small">Available Nodes</p>
          <div className="node-actions">
            {NODE_TYPES.map((type) => (
              <Button
                key={type.id}
                type="button"
                variant={activeNodes.find((n) => n.id === type.id) ? 'primary' : 'secondary'}
                onClick={() => toggleNode(type.id)}
              >
                {activeNodes.find((n) => n.id === type.id) ? '✓' : '+'} {type.label}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            className="full-width"
            onClick={createWorkflow}
            disabled={creatingWorkflow}
          >
            {creatingWorkflow ? 'Creating...' : 'Create Workflow'}
          </Button>
        </Card>

        <Card>
          <h3>Saved Workflows</h3>
          {loadingWorkflows ? (
            <p>Loading workflows...</p>
          ) : workflows.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No workflows yet"
              text="Create a workflow to see it here"
            />
          ) : (
            <div className="workflow-list">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="workflow-item">
                  <div className="workflow-info">
                    <h4>{workflow.name}</h4>
                    <p className="text-small">
                      Nodes: {workflow.nodes?.length || 0} | Status: {workflow.status}
                    </p>
                  </div>
                  <div className="workflow-actions">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => executeWorkflow(workflow.id)}
                    >
                      Run
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => deleteWorkflow(workflow.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}

export default AutomationPage
