const express        = require('express');
const swaggerUi      = require('swagger-ui-express');
const swaggerSpec    = require('./swagger');
const routes         = require('./src/routes');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Documentação Swagger em http://localhost:${PORT}/api-docs`);
});

module.exports = app;
