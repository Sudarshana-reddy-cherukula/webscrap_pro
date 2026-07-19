const Workflow = require('../models/Workflow');
const WorkflowRun = require('../models/WorkflowRun');
const logger = require('../utils/logger');

class WorkflowService {
  constructor() {
    this.scrapingService = null;
    this.aiService = null;
  }

  setServices(scrapingService, aiService) {
    this.scrapingService = scrapingService;
    this.aiService = aiService;
  }

  async createWorkflow(userId, data) {
    const workflow = await Workflow.create({ userId, ...data });
    logger.info(`Workflow created: ${workflow._id} by user ${userId}`);
    return workflow;
  }

  async getWorkflows(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [workflows, total] = await Promise.all([
      Workflow.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Workflow.countDocuments({ userId }),
    ]);
    return { workflows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getWorkflow(workflowId, userId) {
    const workflow = await Workflow.findOne({ _id: workflowId, userId });
    if (!workflow) throw new Error('Workflow not found');
    return workflow;
  }

  async updateWorkflow(workflowId, userId, updates) {
    const workflow = await Workflow.findOneAndUpdate(
      { _id: workflowId, userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!workflow) throw new Error('Workflow not found');
    return workflow;
  }

  async deleteWorkflow(workflowId, userId) {
    const workflow = await Workflow.findOneAndDelete({ _id: workflowId, userId });
    if (!workflow) throw new Error('Workflow not found');
    return { message: 'Workflow deleted' };
  }

  async toggleWorkflow(workflowId, userId) {
    const workflow = await Workflow.findOne({ _id: workflowId, userId });
    if (!workflow) throw new Error('Workflow not found');
    workflow.enabled = !workflow.enabled;
    await workflow.save();
    return workflow;
  }

  async executeWorkflow(workflowId, userId, triggerType = 'manual') {
    const workflow = await Workflow.findOne({ _id: workflowId, userId });
    if (!workflow) throw new Error('Workflow not found');

    const run = await WorkflowRun.create({
      userId,
      workflowId,
      triggerType,
      status: 'running',
      stepsRun: workflow.steps.map(step => ({
        stepId: step._id,
        stepName: step.name,
        stepType: step.type,
        status: 'pending',
      })),
    });

    workflow.lastRun = new Date();
    workflow.runCount += 1;
    workflow.lastStatus = 'running';

    let context = {};
    let failed = false;

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      if (!step.enabled) {
        run.stepsRun[i].status = 'skipped';
        continue;
      }

      run.stepsRun[i].status = 'running';
      run.stepsRun[i].startedAt = new Date();
      await run.save();

      try {
        const result = await this.executeStep(step, context);
        run.stepsRun[i].status = 'success';
        run.stepsRun[i].output = typeof result === 'string' ? result.slice(0, 10000) : result;
        run.stepsRun[i].completedAt = new Date();
        run.stepsRun[i].duration = Date.now() - run.stepsRun[i].startedAt.getTime();
        context = { ...context, [step.type]: result };
      } catch (error) {
        run.stepsRun[i].status = 'failed';
        run.stepsRun[i].error = error.message;
        run.stepsRun[i].completedAt = new Date();
        run.stepsRun[i].duration = Date.now() - run.stepsRun[i].startedAt.getTime();

        if (step.onError === 'stop') {
          failed = true;
          break;
        } else if (step.onError === 'retry') {
          let retried = false;
          for (let r = 0; r < (step.retryCount || 3); r++) {
            try {
              const retryResult = await this.executeStep(step, context);
              run.stepsRun[i].status = 'success';
              run.stepsRun[i].output = typeof retryResult === 'string' ? retryResult.slice(0, 10000) : retryResult;
              run.stepsRun[i].error = null;
              retried = true;
              break;
            } catch (retryErr) {
              run.stepsRun[i].error = retryErr.message;
            }
          }
          if (!retried) {
            failed = true;
            break;
          }
        }
      }
    }

    run.completedAt = new Date();
    run.duration = run.completedAt - run.startedAt;
    run.status = failed ? 'failed' : 'success';
    workflow.lastStatus = run.status;
    workflow.lastError = failed ? run.stepsRun.find(s => s.status === 'failed')?.error : null;
    await Promise.all([run.save(), workflow.save()]);

    logger.info(`Workflow run ${run._id} completed with status: ${run.status}`);
    return run;
  }

  async executeStep(step, context) {
    switch (step.type) {
      case 'scrape':
        return this.executeScrapeStep(step.config, context);
      case 'transform':
        return this.executeTransformStep(step.config, context);
      case 'condition':
        return this.executeConditionStep(step.config, context);
      case 'export':
        return this.executeExportStep(step.config, context);
      case 'webhook':
        return this.executeWebhookStep(step.config, context);
      case 'delay':
        return this.executeDelayStep(step.config);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  async executeScrapeStep(config, context) {
    if (!this.scrapingService) throw new Error('Scraping service not available');
    const url = config.url || context.url;
    if (!url) throw new Error('No URL provided for scrape step');
    const result = await this.scrapingService.scrapeUrl(null, url, {
      extractText: true,
      extractLinks: config.extractLinks || false,
      extractImages: config.extractImages || false,
      extractMetadata: config.extractMetadata || true,
    });
    return { url, text: result?.results?.text?.slice(0, 50000), metadata: result?.results?.metadata };
  }

  async executeTransformStep(config, context) {
    const text = context.scrape?.text || '';
    if (!text) throw new Error('No text content to transform');
    const operation = config.operation || 'extractText';
    switch (operation) {
      case 'extractText':
        return { text: text.slice(0, config.maxLength || 50000) };
      case 'summarize':
        if (this.aiService) {
          const result = await this.aiService.summarize(text, { style: config.style || 'concise' });
          return { summary: result.summary };
        }
        return { text: text.slice(0, 500) };
      case 'extractKeywords':
        if (this.aiService) {
          return await this.aiService.extractKeywords(text, { maxKeywords: config.maxKeywords || 10 });
        }
        return { keywords: [] };
      default:
        return { text };
    }
  }

  async executeConditionStep(config, context) {
    const field = config.field || 'scrape.text';
    const operator = config.operator || 'contains';
    const value = config.value || '';
    let actual = context;
    for (const key of field.split('.')) {
      actual = actual?.[key];
    }
    let result = false;
    switch (operator) {
      case 'contains': result = String(actual || '').includes(value); break;
      case 'notContains': result = !String(actual || '').includes(value); break;
      case 'equals': result = actual === value; break;
      case 'notEmpty': result = !!actual && String(actual).length > 0; break;
      default: result = !!actual;
    }
    return { conditionMet: result };
  }

  async executeExportStep(config, context) {
    return { exported: true, format: config.format || 'json', timestamp: new Date().toISOString() };
  }

  async executeWebhookStep(config, context) {
    if (!config.url) throw new Error('No webhook URL provided');
    try {
      const axios = require('axios');
      const response = await axios.post(config.url, {
        event: 'workflow.step',
        data: context,
        timestamp: new Date().toISOString(),
      }, { timeout: 10000 });
      return { status: response.status, success: true };
    } catch (error) {
      throw new Error(`Webhook call failed: ${error.message}`);
    }
  }

  async executeDelayStep(config) {
    const ms = Math.min(config.duration || 1000, 60000);
    await new Promise(resolve => setTimeout(resolve, ms));
    return { delayed: ms };
  }

  async getRunHistory(workflowId, userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [runs, total] = await Promise.all([
      WorkflowRun.find({ workflowId, userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WorkflowRun.countDocuments({ workflowId, userId }),
    ]);
    return { runs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getRun(runId, userId) {
    const run = await WorkflowRun.findOne({ _id: runId, userId });
    if (!run) throw new Error('Run not found');
    return run;
  }

  async cancelRun(runId, userId) {
    const run = await WorkflowRun.findOne({ _id: runId, userId, status: 'running' });
    if (!run) throw new Error('Running run not found');
    run.status = 'cancelled';
    run.completedAt = new Date();
    await run.save();
    return run;
  }

  async getStats(userId) {
    const [totalWorkflows, activeWorkflows, totalRuns, recentRuns] = await Promise.all([
      Workflow.countDocuments({ userId }),
      Workflow.countDocuments({ userId, enabled: true }),
      WorkflowRun.countDocuments({ userId }),
      WorkflowRun.find({ userId }).sort({ createdAt: -1 }).limit(5),
    ]);
    const successRuns = await WorkflowRun.countDocuments({ userId, status: 'success' });
    const failedRuns = await WorkflowRun.countDocuments({ userId, status: 'failed' });
    return {
      totalWorkflows,
      activeWorkflows,
      totalRuns,
      successRuns,
      failedRuns,
      successRate: totalRuns > 0 ? ((successRuns / totalRuns) * 100).toFixed(1) : '0',
      recentRuns,
    };
  }
}

module.exports = new WorkflowService();
