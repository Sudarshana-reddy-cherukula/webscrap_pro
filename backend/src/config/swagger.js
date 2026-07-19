const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'WebScrap Pro API',
      version: '1.0.0',
      description: 'Production-grade API for web scraping and PDF processing',
      contact: { name: 'WebScrap Pro' },
    },
    servers: [
      { url: '/api/v1', description: 'API v1' },
      { url: '/api', description: 'Legacy (unversioned)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            correlationId: { type: 'string' },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            status: { type: 'string', enum: ['healthy', 'unhealthy'] },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string' },
            uptime: { type: 'number' },
            checks: {
              type: 'object',
              properties: {
                database: { type: 'object' },
                memory: { type: 'object' },
              },
            },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 50 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        ScrapeJob: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
            targetUrl: { type: 'string' },
            results: { type: 'object' },
          },
        },
        Workflow: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            steps: { type: 'array', items: { type: 'object' } },
            enabled: { type: 'boolean' },
            trigger: { type: 'object' },
            lastRun: { type: 'string', format: 'date-time' },
            runCount: { type: 'integer' },
          },
        },
        WorkflowRun: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            workflowId: { type: 'string' },
            status: { type: 'string', enum: ['running', 'success', 'failed', 'cancelled'] },
            stepsRun: { type: 'array' },
            startedAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
            duration: { type: 'number' },
          },
        },
        Webhook: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            url: { type: 'string' },
            events: { type: 'array', items: { type: 'string' } },
            enabled: { type: 'boolean' },
            lastTriggered: { type: 'string', format: 'date-time' },
          },
        },
        CursorPagination: {
          type: 'object',
          properties: {
            nextCursor: { type: 'string', nullable: true },
            hasMore: { type: 'boolean' },
            limit: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
