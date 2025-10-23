const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E4U Backend API',
      version: '1.0.0',
      description: 'API documentation for E4U Backend - Education Management System',
      contact: {
        name: 'E4U Team',
        email: 'support@e4u.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? process.env.API_URL || 'https://your-domain.com'
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            role: {
              type: 'string',
              enum: ['admin', 'teacher', 'student'],
              description: 'User role'
            },
            avatar: {
              type: 'string',
              description: 'User avatar URL'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Class: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Class ID'
            },
            name: {
              type: 'string',
              description: 'Class name'
            },
            description: {
              type: 'string',
              description: 'Class description'
            },
            teacher: {
              type: 'string',
              description: 'Teacher ID'
            },
            students: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of student IDs'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      },
      {
        cookieAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js',
    './server.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  specs
};
