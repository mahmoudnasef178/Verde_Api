const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

// Dynamically resolve the public server URL.
// When deployed online, set SERVER_URL in your environment variables.
// e.g. SERVER_URL=https://verde-api.onrender.com
const serverUrl = process.env.SERVER_URL || null;

const servers = serverUrl
  ? [{ url: serverUrl, description: 'سيرفر الإنتاج (Production)' }]
  : [{ url: '/', description: 'السيرفر الحالي (Current Server)' }];

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🌿 Verde Parfums REST API',
      version: '1.0.0',
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
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../app.js'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

