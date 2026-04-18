const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gerenciador de Reuniões',
      version: '1.0.0',
      description: 'API REST para agendamento de salas de reunião corporativas com controle de acesso por JWT.',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', example: 'admin@empresa.com' },
            password: { type: 'string', example: 'admin123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'Bearer JWT' },
            user: {
              type: 'object',
              properties: {
                id:    { type: 'integer' },
                name:  { type: 'string' },
                email: { type: 'string' },
                role:  { type: 'string', enum: ['admin', 'funcionario'] },
              },
            },
          },
        },
        Room: {
          type: 'object',
          properties: {
            id:       { type: 'integer', example: 1 },
            name:     { type: 'string',  example: 'Sala Alpha' },
            capacity: { type: 'integer', example: 10 },
            location: { type: 'string',  example: 'Andar 1' },
          },
        },
        RoomInput: {
          type: 'object',
          required: ['name', 'capacity', 'location'],
          properties: {
            name:     { type: 'string',  example: 'Sala Gama' },
            capacity: { type: 'integer', example: 8 },
            location: { type: 'string',  example: 'Andar 3' },
          },
        },
        Schedule: {
          type: 'object',
          properties: {
            id:     { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 2 },
            roomId: { type: 'integer', example: 1 },
            title:  { type: 'string',  example: 'Reunião de planejamento' },
            start:  { type: 'string',  format: 'date-time', example: '2026-05-10T14:00:00' },
            end:    { type: 'string',  format: 'date-time', example: '2026-05-10T15:30:00' },
          },
        },
        ScheduleInput: {
          type: 'object',
          required: ['roomId', 'start', 'end', 'title'],
          properties: {
            roomId: { type: 'integer', example: 1 },
            title:  { type: 'string',  example: 'Reunião de planejamento' },
            start:  { type: 'string',  format: 'date-time', example: '2026-05-10T14:00:00' },
            end:    { type: 'string',  format: 'date-time', example: '2026-05-10T15:30:00' },
          },
        },
        ScheduleUpdateInput: {
          type: 'object',
          properties: {
            roomId: { type: 'integer', example: 2 },
            title:  { type: 'string',  example: 'Reunião ajustada' },
            start:  { type: 'string',  format: 'date-time', example: '2026-05-10T15:00:00' },
            end:    { type: 'string',  format: 'date-time', example: '2026-05-10T16:00:00' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Mensagem de erro' },
          },
        },
      },
      responses: {
        BadRequest:   { description: 'Dados inválidos',                content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Unauthorized: { description: 'Token ausente ou inválido',      content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Forbidden:    { description: 'Sem permissão para esta ação',   content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        NotFound:     { description: 'Recurso não encontrado',         content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Conflict:     { description: 'Conflito de horário detectado',  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    tags: [
      { name: 'Autenticação', description: 'Login e geração de token JWT' },
      { name: 'Salas',        description: 'Gerenciamento de salas de reunião' },
      { name: 'Agendamentos', description: 'Criação e gestão de reservas' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
