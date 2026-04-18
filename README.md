# API Gerenciador de Reuniões

API REST para agendamento de salas de reunião corporativas, desenvolvida como parte da simulação de Sprint Ágil da **Mentoria em Testes de Software 2.0 — Turma 3 2026**.

---

## Stack

| Tecnologia | Uso |
|---|---|
| Node.js + Express | Servidor e rotas |
| JWT (jsonwebtoken) | Autenticação Bearer Token |
| swagger-ui-express | Documentação interativa |
| Banco em memória | Arrays/Objects (sem banco externo) |

---

## Instalação e execução

```bash
npm install
npm start          # produção
npm run dev        # desenvolvimento com hot-reload (nodemon)
```

A API sobe em `http://localhost:3000`.  
A documentação Swagger fica disponível em `http://localhost:3000/api-docs`.

---

## Autenticação

Todos os endpoints (exceto `POST /login`) exigem o header:

```
Authorization: Bearer <token>
```

O token é obtido via `POST /login` e expira em **8 horas**.

### Usuários pré-carregados

| Email | Senha | Perfil |
|---|---|---|
| admin@empresa.com | admin123 | admin |
| joao@empresa.com | joao123 | funcionario |
| maria@empresa.com | maria123 | funcionario |

---

## Endpoints

### Autenticação

| Método | Rota | Descrição |
|---|---|---|
| POST | `/login` | Autentica e retorna JWT |

### Salas

| Método | Rota | Perfil mínimo | Descrição |
|---|---|---|---|
| GET | `/salas` | funcionario | Lista todas as salas |
| POST | `/criarSala` | admin | Cria uma nova sala |
| DELETE | `/apagarSala/:id` | admin | Remove uma sala |

### Agendamentos

| Método | Rota | Perfil mínimo | Descrição |
|---|---|---|---|
| GET | `/agenda` | funcionario | Lista todos os agendamentos |
| GET | `/agenda/:id` | funcionario | Lista agendamentos de uma sala |
| POST | `/reservarSala` | funcionario | Cria um agendamento |
| PUT | `/ajustarAgendamento/:id` | funcionario | Atualiza um agendamento |
| DELETE | `/deletarAgendamento/:id` | funcionario | Remove um agendamento |

---

## Regras de negócio

- Agendamentos devem ser criados para datas **futuras**
- Duração máxima de **8 horas** por agendamento
- Antecedência máxima de **90 dias**
- Não é permitido **conflito de horário na mesma sala**
- Um funcionário **não pode ter duas reservas simultâneas** em salas diferentes
- Funcionários só podem editar/deletar **seus próprios** agendamentos
- Admins podem editar/deletar **qualquer** agendamento
- Salas com agendamentos vinculados **não podem ser deletadas**

---

## Estrutura do projeto

```
src/
├── controllers/        # Recebem requisição, delegam para services, devolvem resposta
│   ├── authController.js
│   ├── roomController.js
│   └── schedulingController.js
├── services/           # Lógica de negócio e validações
│   ├── authService.js
│   ├── roomService.js
│   └── schedulingService.js
├── models/
│   └── database.js     # Banco de dados em memória
├── middlewares/
│   ├── authMiddleware.js   # Validação do JWT
│   └── roleMiddleware.js   # Controle de perfil (admin/funcionario)
└── routes/
    └── index.js        # Definição das rotas com anotações Swagger
```

---

## Smoke tests

O arquivo `test.js` contém 22 cenários de validação que cobrem os principais fluxos e regras de negócio:

```bash
node test.js
```

> A API deve estar em execução na porta 3000 antes de rodar os testes.

---

## Códigos de resposta

| Código | Significado |
|---|---|
| 200 | Sucesso |
| 201 | Recurso criado |
| 400 | Dados inválidos ou regra de negócio violada |
| 401 | Token ausente ou inválido |
| 403 | Sem permissão para a ação |
| 404 | Recurso não encontrado |
| 409 | Conflito de horário |
