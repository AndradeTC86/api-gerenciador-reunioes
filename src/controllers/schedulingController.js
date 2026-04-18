const schedulingService = require('../services/schedulingService');

function getSchedules(req, res) {
  return res.status(200).json(schedulingService.getSchedules());
}

function getSchedulesByRoom(req, res) {
  const { id } = req.params;
  const list = schedulingService.getSchedulesByRoom(id);
  return res.status(200).json(list);
}

function reservarSala(req, res) {
  const { roomId, start, end, title } = req.body;

  if (!roomId || !start || !end || !title) {
    return res.status(400).json({ error: 'Informe roomId, start, end e title para reservar a sala.' });
  }

  const result = schedulingService.createSchedule({
    userId: req.user.id,
    roomId,
    start,
    end,
    title,
  });

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(201).json(result.data);
}

function ajustarAgendamento(req, res) {
  const { id } = req.params;
  const { roomId, start, end, title } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID do agendamento é obrigatório.' });
  }

  const result = schedulingService.updateSchedule({
    scheduleId: id,
    requesterId: req.user.id,
    requesterRole: req.user.role,
    roomId,
    start,
    end,
    title,
  });

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(200).json(result.data);
}

function deletarAgendamento(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID do agendamento é obrigatório.' });
  }

  const result = schedulingService.deleteSchedule({
    scheduleId: id,
    requesterId: req.user.id,
    requesterRole: req.user.role,
  });

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(200).json({ message: 'Agendamento deletado com sucesso.' });
}

module.exports = { getSchedules, getSchedulesByRoom, reservarSala, ajustarAgendamento, deletarAgendamento };
