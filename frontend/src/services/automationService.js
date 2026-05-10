import httpClient from './httpClient'

export const automationService = {
  // Create a new workflow
  createWorkflow(workflow) {
    return httpClient.post('/automation/workflows', workflow)
  },

  // Get all workflows
  getWorkflows(limit = 50, offset = 0) {
    return httpClient.get('/automation/workflows', { params: { limit, offset } })
  },

  // Get workflow details
  getWorkflow(workflowId) {
    return httpClient.get(`/automation/workflows/${workflowId}`)
  },

  // Update workflow
  updateWorkflow(workflowId, workflow) {
    return httpClient.put(`/automation/workflows/${workflowId}`, workflow)
  },

  // Delete workflow
  deleteWorkflow(workflowId) {
    return httpClient.delete(`/automation/workflows/${workflowId}`)
  },

  // Execute workflow
  executeWorkflow(workflowId, variables = {}) {
    return httpClient.post(`/automation/workflows/${workflowId}/execute`, { variables })
  },

  // Get workflow execution status
  getExecutionStatus(executionId) {
    return httpClient.get(`/automation/executions/${executionId}`)
  },

  // Get workflow execution history
  getExecutionHistory(workflowId, limit = 50, offset = 0) {
    return httpClient.get(`/automation/workflows/${workflowId}/executions`, {
      params: { limit, offset },
    })
  },

  // Cancel workflow execution
  cancelExecution(executionId) {
    return httpClient.post(`/automation/executions/${executionId}/cancel`)
  },

  // Pause workflow execution
  pauseExecution(executionId) {
    return httpClient.post(`/automation/executions/${executionId}/pause`)
  },

  // Resume workflow execution
  resumeExecution(executionId) {
    return httpClient.post(`/automation/executions/${executionId}/resume`)
  },

  // Get available workflow nodes/actions
  getAvailableNodes() {
    return httpClient.get('/automation/nodes')
  },

  // Validate workflow
  validateWorkflow(workflow) {
    return httpClient.post('/automation/workflows/validate', workflow)
  },

  // Get workflow templates
  getTemplates() {
    return httpClient.get('/automation/templates')
  },

  // Get template details
  getTemplate(templateId) {
    return httpClient.get(`/automation/templates/${templateId}`)
  },

  // Create workflow from template
  createFromTemplate(templateId, workflowName) {
    return httpClient.post('/automation/workflows/from-template', {
      templateId,
      workflowName,
    })
  },

  // Clone workflow
  cloneWorkflow(workflowId, newName) {
    return httpClient.post(`/automation/workflows/${workflowId}/clone`, { newName })
  },

  // Enable/disable workflow
  toggleWorkflow(workflowId, enabled) {
    return httpClient.put(`/automation/workflows/${workflowId}/toggle`, { enabled })
  },

  // Schedule workflow execution
  scheduleExecution(workflowId, schedule) {
    return httpClient.post(`/automation/workflows/${workflowId}/schedule`, schedule)
  },

  // Get scheduled executions
  getScheduledExecutions(workflowId) {
    return httpClient.get(`/automation/workflows/${workflowId}/scheduled`)
  },

  // Cancel scheduled execution
  cancelScheduledExecution(scheduleId) {
    return httpClient.delete(`/automation/schedules/${scheduleId}`)
  },

  // Get workflow statistics
  getStatistics(workflowId, timeRange = '7d') {
    return httpClient.get(`/automation/workflows/${workflowId}/statistics`, {
      params: { timeRange },
    })
  },

  // Get execution logs
  getExecutionLogs(executionId) {
    return httpClient.get(`/automation/executions/${executionId}/logs`)
  },

  // Retry failed workflow
  retryWorkflow(executionId) {
    return httpClient.post(`/automation/executions/${executionId}/retry`)
  },

  // Export workflow
  exportWorkflow(workflowId) {
    return httpClient.get(`/automation/workflows/${workflowId}/export`, {
      responseType: 'blob',
    })
  },

  // Import workflow
  importWorkflow(file) {
    const formData = new FormData()
    formData.append('file', file)
    return httpClient.post('/automation/workflows/import', formData)
  },
}
