const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

// Dynamically resolve the public server URL.
// When deployed online, set SERVER_URL in your environment variables.
// e.g. SERVER_URL=https://verde-api.onrender.com
const serverUrl = process.env.SERVER_URL || null;

const servers = serverUrl
  ? [{ url: serverUrl, description: 'سيرفر الإنتاج (Production)' }]
  : [{ url: '/', description: 'السيرفر الحالي (Current Server)' }];

const routesPath = path.join(__dirname, '../routes/*.js').replace(/\\/g, '/');
const appPath = path.join(__dirname, '../app.js').replace(/\\/g, '/');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🌿 Verde Parfums REST API',
      version: '1.0.2',
      description: 'المستندات التفاعلية الخاصة بـ Verde Parfums API — تعمل أونلاين بالكامل.',
      contact: {
        name: 'Verde Support',
        email: 'support@verdeparfums.com',
      },
    },
    servers,
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'أدخل توكن الـ JWT (بدون كلمة Bearer، يتم إضافتها تلقائياً)',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '65e123456789abcdef012345' },
            name: { type: 'string', example: 'أحمد محمود' },
            email: { type: 'string', example: 'ahmed@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            avatar: { type: 'string', nullable: true, example: null },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'تم العملية بنجاح' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'حدث خطأ في الطلب' },
          },
        },
      },
    },
  },
  apis: [routesPath, appPath],
};

const swaggerSpec = swaggerJSDoc(options);

// Guarantee /api/users and /api/users/all are present in paths regardless of environment/glob parsing
swaggerSpec.paths = swaggerSpec.paths || {};

swaggerSpec.paths['/api/users'] = {
  get: {
    summary: 'جلب جميع المستخدمين المسجلين في النظام (Get All Users)',
    description: 'يرجع قائمة بجميع حسابات المستخدمين المسجلين مع كافة تفاصيل الحساب وكلمة المرور المشفرة.',
    tags: ['GetAllUser'],
    responses: {
      '200': {
        description: 'قائمة بجميع المستخدمين المسجلين وحساباتهم بنجاح (تتضمن كلمة المرور)',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                count: { type: 'integer', example: 2 },
                users: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string', example: '65e123456789abcdef012345' },
                      name: { type: 'string', example: 'أحمد محمود' },
                      email: { type: 'string', example: 'ahmed@example.com' },
                      password: { type: 'string', example: '$2a$12$eXamPleHaShedPasSWorD...' },
                      phone: { type: 'string', example: '01012345678' },
                      role: { type: 'string', example: 'user' },
                      avatar: { type: 'string', nullable: true, example: null },
                      addresses: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            fullName: { type: 'string', example: 'أحمد محمود' },
                            phone: { type: 'string', example: '01012345678' },
                            city: { type: 'string', example: 'القاهرة' },
                            address: { type: 'string', example: 'المعادي، شارع 9' },
                            isDefault: { type: 'boolean', example: true },
                          },
                        },
                      },
                      createdAt: { type: 'string', example: '2026-08-23T01:00:00.000Z' },
                      updatedAt: { type: 'string', example: '2026-08-23T01:00:00.000Z' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

swaggerSpec.paths['/api/users/all'] = swaggerSpec.paths['/api/users'];

module.exports = swaggerSpec;


