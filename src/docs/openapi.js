const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const bearerSecurity = [{ bearerAuth: [] }];

const openApiDocument = (req) => ({
  openapi: '3.0.3',
  info: {
    title: 'Finance Backend API',
    version: '1.0.0',
    description:
      'Role-based finance dashboard backend built with Express, Prisma, and PostgreSQL.',
  },
  servers: [
    {
      url: getBaseUrl(req),
      description: 'Current environment',
    },
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Records' },
    { name: 'Dashboard' },
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
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email address' },
              },
            },
          },
        },
      },
      SuccessEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
          data: {},
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', format: 'password', example: 'Password1' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@finance.com' },
          password: { type: 'string', format: 'password', example: 'Admin@123' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Record: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          amount: { type: 'number', example: 2500 },
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          category: { type: 'string', example: 'Consulting' },
          date: { type: 'string', format: 'date-time' },
          notes: { type: 'string', nullable: true },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          userId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateRecordRequest: {
        type: 'object',
        required: ['amount', 'type', 'category', 'date'],
        properties: {
          amount: { type: 'number', minimum: 0.01, example: 2500 },
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          category: { type: 'string', minLength: 2, example: 'Consulting' },
          date: { type: 'string', format: 'date-time', example: '2026-04-01T00:00:00.000Z' },
          notes: { type: 'string', example: 'Client invoice' },
        },
      },
      UpdateRecordRequest: {
        type: 'object',
        properties: {
          amount: { type: 'number', minimum: 0.01, example: 3000 },
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          category: { type: 'string', minLength: 2, example: 'Retainer' },
          date: { type: 'string', format: 'date-time' },
          notes: { type: 'string', example: 'Updated notes' },
        },
      },
      DashboardSummary: {
        type: 'object',
        properties: {
          totalIncome: { type: 'number', example: 9800 },
          totalExpenses: { type: 'number', example: 4200 },
          netBalance: { type: 'number', example: 5600 },
          totalTransactions: { type: 'integer', example: 12 },
        },
      },
      CategoryBreakdownItem: {
        type: 'object',
        properties: {
          category: { type: 'string', example: 'Salary' },
          total: { type: 'number', example: 5000 },
          count: { type: 'integer', example: 2 },
        },
      },
      MonthlyTrendItem: {
        type: 'object',
        properties: {
          month: { type: 'string', example: '2026-03' },
          income: { type: 'number', example: 8000 },
          expense: { type: 'number', example: 3200 },
          net: { type: 'number', example: 4800 },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Application status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new viewer account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/User' },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { description: 'Validation failed' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
          },
          401: { description: 'Invalid credentials' },
          403: { description: 'Inactive account' },
        },
      },
    },
    '/api/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: bearerSecurity,
        responses: {
          200: { description: 'Profile returned' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        security: bearerSecurity,
        parameters: [
          { in: 'query', name: 'role', schema: { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] } },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'Users returned' },
          403: { description: 'Admin only' },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by id',
        security: bearerSecurity,
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'User returned' },
          404: { description: 'User not found' },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update user',
        security: bearerSecurity,
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  role: { type: 'string', enum: ['VIEWER', 'ANALYST', 'ADMIN'] },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'User updated' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user',
        security: bearerSecurity,
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'User deleted' },
        },
      },
    },
    '/api/users/{id}/deactivate': {
      patch: {
        tags: ['Users'],
        summary: 'Deactivate user',
        security: bearerSecurity,
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'User deactivated' },
        },
      },
    },
    '/api/records': {
      get: {
        tags: ['Records'],
        summary: 'List records with filters and pagination',
        security: bearerSecurity,
        parameters: [
          { in: 'query', name: 'type', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] } },
          { in: 'query', name: 'category', schema: { type: 'string' } },
          { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date-time' } },
          { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date-time' } },
          { in: 'query', name: 'userId', schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'Records returned' },
        },
      },
      post: {
        tags: ['Records'],
        summary: 'Create record',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateRecordRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Record created' },
          403: { description: 'Admin or analyst only' },
        },
      },
    },
    '/api/records/{id}': {
      get: {
        tags: ['Records'],
        summary: 'Get record by id',
        security: bearerSecurity,
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Record returned' },
          404: { description: 'Record not found' },
        },
      },
      patch: {
        tags: ['Records'],
        summary: 'Update record',
        security: bearerSecurity,
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateRecordRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Record updated' },
          403: { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Records'],
        summary: 'Soft delete record',
        security: bearerSecurity,
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Record deleted' },
        },
      },
    },
    '/api/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard summary',
        security: bearerSecurity,
        responses: {
          200: {
            description: 'Summary returned',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/DashboardSummary' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/api/dashboard/by-category': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get category breakdown',
        security: bearerSecurity,
        parameters: [
          { in: 'query', name: 'type', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] } },
        ],
        responses: {
          200: {
            description: 'Category totals returned',
          },
        },
      },
    },
    '/api/dashboard/trends': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get monthly trends',
        security: bearerSecurity,
        parameters: [{ in: 'query', name: 'year', schema: { type: 'integer', example: 2026 } }],
        responses: {
          200: { description: 'Monthly trends returned' },
          403: { description: 'Analyst or admin only' },
        },
      },
    },
    '/api/dashboard/recent': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get recent activity',
        security: bearerSecurity,
        parameters: [{ in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } }],
        responses: {
          200: { description: 'Recent activity returned' },
        },
      },
    },
  },
});

const renderDocsHtml = () => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Finance Backend API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #fafafa; }
      .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      });
    </script>
  </body>
</html>`;

module.exports = {
  openApiDocument,
  renderDocsHtml,
};
