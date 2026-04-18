const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole    = require('../middlewares/roleMiddleware');
const authCtrl       = require('../controllers/authController');
const roomCtrl       = require('../controllers/roomController');
const schedCtrl      = require('../controllers/schedulingController');

const router = Router();

// ── Autenticação ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autentica um funcionário e retorna JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Token JWT gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Email ou senha ausentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               campos_obrigatorios:
 *                 value:
 *                   error: 'Email e senha são obrigatórios.'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               credenciais_invalidas:
 *                 value:
 *                   error: 'Credenciais inválidas.'
 */
router.post('/login', authCtrl.login);

// ── Salas ─────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /salas:
 *   get:
 *     summary: Lista todas as salas
 *     tags: [Salas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de salas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/salas', authMiddleware, roomCtrl.listRooms);

/**
 * @swagger
 * /criarSala:
 *   post:
 *     summary: Cria uma nova sala (Admin)
 *     tags: [Salas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoomInput'
 *     responses:
 *       201:
 *         description: Sala criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         description: Nome, capacidade ou localização ausentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               campos_obrigatorios:
 *                 value:
 *                   error: 'Nome, capacidade e localização são obrigatórios.'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/criarSala', authMiddleware, requireRole('admin'), roomCtrl.createRoom);

/**
 * @swagger
 * /apagarSala/{id}:
 *   delete:
 *     summary: Remove uma sala (Admin)
 *     tags: [Salas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da sala
 *     responses:
 *       200:
 *         description: Sala deletada com sucesso
 *       400:
 *         description: ID da sala ausente ou sala com agendamentos vinculados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               id_obrigatorio:
 *                 value:
 *                   error: 'ID da sala é obrigatório.'
 *               sala_com_agendamentos:
 *                 value:
 *                   error: 'Sala possui agendamentos vinculados e não pode ser deletada.'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Sala informada não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               sala_nao_encontrada:
 *                 value:
 *                   error: 'Sala não encontrada.'
 */
router.delete('/apagarSala/:id', authMiddleware, requireRole('admin'), roomCtrl.deleteRoom);

// ── Agendamentos ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /agenda:
 *   get:
 *     summary: Lista todos os agendamentos
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/agenda', authMiddleware, schedCtrl.getSchedules);

/**
 * @swagger
 * /agenda/{id}:
 *   get:
 *     summary: Lista agendamentos de uma sala específica
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da sala
 *     responses:
 *       200:
 *         description: Agendamentos da sala
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/agenda/:id', authMiddleware, schedCtrl.getSchedulesByRoom);

/**
 * @swagger
 * /reservarSala:
 *   post:
 *     summary: Cria um novo agendamento de sala
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleInput'
 *     responses:
 *       201:
 *         description: Agendamento criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Dados inválidos para criar a reserva
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               campos_obrigatorios:
 *                 summary: Campos obrigatórios ausentes
 *                 value:
 *                   error: 'Informe roomId, start, end e title para reservar a sala.'
 *               datas_invalidas:
 *                 summary: Datas em formato inválido
 *                 value:
 *                   error: 'As datas informadas são inválidas. Use o formato ISO 8601, como 2026-05-10T14:00:00.'
 *               inicio_passado:
 *                 summary: Horário inicial anterior ao momento atual
 *                 value:
 *                   error: 'Não é possível agendar com horário inicial anterior ao momento atual.'
 *               horario_invalido:
 *                 summary: Horário final menor ou igual ao inicial
 *                 value:
 *                   error: 'A hora final da reserva deve ser maior que a hora inicial.'
 *               duracao_maxima:
 *                 summary: Duração maior que 8 horas
 *                 value:
 *                   error: 'A reserva não pode ultrapassar 8 horas de duração.'
 *               antecedencia_maxima:
 *                 summary: Reserva com antecedência superior a 90 dias
 *                 value:
 *                   error: 'A reserva pode ser criada com no máximo 90 dias de antecedência.'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Sala informada não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               sala_nao_encontrada:
 *                 value:
 *                   error: 'Sala informada não encontrada.'
 *       409:
 *         description: Conflito de horário ao criar a reserva
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               sala_reservada:
 *                 summary: Sala já reservada no período
 *                 value:
 *                   error: 'Não é possível agendar em horário já reservado para esta sala.'
 *               funcionario_com_conflito:
 *                 summary: Funcionário com outra reserva no mesmo horário
 *                 value:
 *                   error: 'Não é possível agendar duas reservas no mesmo horário para o mesmo funcionário.'
 */
router.post('/reservarSala', authMiddleware, schedCtrl.reservarSala);

/**
 * @swagger
 * /ajustarAgendamento/{id}:
 *   put:
 *     summary: Atualiza um agendamento existente
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do agendamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleUpdateInput'
 *     responses:
 *       200:
 *         description: Agendamento atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Dados inválidos ou intervalo de data inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               datas_invalidas:
 *                 value:
 *                   error: 'As datas informadas são inválidas. Use o formato ISO 8601, como 2026-05-10T14:00:00.'
 *               inicio_passado:
 *                 value:
 *                   error: 'Não é possível agendar com horário inicial anterior ao momento atual.'
 *               horario_invalido:
 *                 value:
 *                   error: 'A hora final da reserva deve ser maior que a hora inicial.'
 *               duracao_maxima:
 *                 value:
 *                   error: 'A reserva não pode ultrapassar 8 horas de duração.'
 *               antecedencia_maxima:
 *                 value:
 *                   error: 'A reserva pode ser criada com no máximo 90 dias de antecedência.'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Usuário sem permissão para editar este agendamento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               sem_permissao:
 *                 value:
 *                   error: 'Você não tem permissão para editar este agendamento.'
 *       404:
 *         description: Agendamento ou sala não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               agendamento_nao_encontrado:
 *                 value:
 *                   error: 'Agendamento não encontrado.'
 *               sala_nao_encontrada:
 *                 value:
 *                   error: 'Sala não encontrada.'
 *       409:
 *         description: Conflito de horário ao atualizar a reserva
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               sala_reservada:
 *                 value:
 *                   error: 'Conflito de horário: sala já reservada neste período.'
 *               funcionario_com_conflito:
 *                 value:
 *                   error: 'Conflito de horário: o funcionário já possui uma reserva neste período.'
 */
router.put('/ajustarAgendamento/:id', authMiddleware, schedCtrl.ajustarAgendamento);

/**
 * @swagger
 * /deletarAgendamento/{id}:
 *   delete:
 *     summary: Remove um agendamento
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do agendamento
 *     responses:
 *       200:
 *         description: Agendamento deletado
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Usuário sem permissão para deletar este agendamento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               sem_permissao:
 *                 value:
 *                   error: 'Você não tem permissão para deletar este agendamento.'
 *       404:
 *         description: Agendamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               agendamento_nao_encontrado:
 *                 value:
 *                   error: 'Agendamento não encontrado.'
 */
router.delete('/deletarAgendamento/:id', authMiddleware, schedCtrl.deletarAgendamento);

module.exports = router;
