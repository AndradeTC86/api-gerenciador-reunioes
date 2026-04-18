const db = require('../models/database');

const MAX_DURATION_MS = 8 * 60 * 60 * 1000;      // 8 horas em ms
const MAX_ADVANCE_MS  = 90 * 24 * 60 * 60 * 1000; // 90 dias em ms

/**
 * Valida se o intervalo [start, end] respeita todas as restrições temporais:
 * - start deve estar no futuro (> agora)
 * - end deve ser após start
 * - duração máxima de 8 horas
 * - antecedência máxima de 90 dias a partir de agora
 * Retorna string de erro ou null se válido.
 */
function validateDateRange(start, end) {
  const now       = new Date();
  const startDate = new Date(start);
  const endDate   = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 'Datas inválidas. Use o formato ISO 8601 (ex: 2026-05-10T14:00:00).';
  }
  if (startDate <= now) {
    return 'O agendamento deve ser para uma data/hora futura.';
  }
  if (endDate <= startDate) {
    return 'O horário de término deve ser posterior ao horário de início.';
  }
  if (endDate - startDate > MAX_DURATION_MS) {
    return 'A duração máxima permitida por agendamento é de 8 horas.';
  }
  if (startDate - now > MAX_ADVANCE_MS) {
    return 'Agendamentos podem ser feitos com no máximo 90 dias de antecedência.';
  }

  return null;
}

/**
 * Verifica se dois intervalos de tempo se sobrepõem.
 * Sobreposição ocorre quando um começa antes do outro terminar e vice-versa.
 * Intervalos adjacentes (um termina exatamente quando o outro começa) não conflitam.
 */
function hasOverlap(s1, e1, s2, e2) {
  return s1 < e2 && s2 < e1;
}

/**
 * Verifica conflito de sala: outra reserva na mesma sala com horário sobreposto.
 * excludeScheduleId permite ignorar o próprio agendamento em operações de atualização.
 */
function checkRoomConflict(roomId, start, end, excludeScheduleId = null) {
  const s = new Date(start);
  const e = new Date(end);

  return db.schedules.some(ag => {
    if (ag.id === excludeScheduleId) return false;
    if (ag.roomId !== roomId)        return false;
    return hasOverlap(s, e, new Date(ag.start), new Date(ag.end));
  });
}

/**
 * Verifica conflito de usuário: o mesmo funcionário já possui reserva em qualquer
 * sala com horário sobreposto — impede dupla reserva simultânea.
 */
function checkUserConflict(userId, start, end, excludeScheduleId = null) {
  const s = new Date(start);
  const e = new Date(end);

  return db.schedules.some(ag => {
    if (ag.id === excludeScheduleId) return false;
    if (ag.userId !== userId)        return false;
    return hasOverlap(s, e, new Date(ag.start), new Date(ag.end));
  });
}

function createSchedule({ userId, roomId, start, end, title }) {
  const id = Number(roomId);

  const dateError = validateDateRange(start, end);
  if (dateError) return { error: dateError, status: 400 };

  if (!db.rooms.find(r => r.id === id)) {
    return { error: 'Sala não encontrada.', status: 404 };
  }
  if (checkRoomConflict(id, start, end)) {
    return { error: 'Conflito de horário: sala já reservada neste período.', status: 409 };
  }
  if (checkUserConflict(userId, start, end)) {
    return { error: 'Conflito de horário: você já possui uma reserva neste período.', status: 409 };
  }

  const schedule = { id: db.getNextScheduleId(), userId, roomId: id, start, end, title };
  db.schedules.push(schedule);
  return { data: schedule };
}

function updateSchedule({ scheduleId, requesterId, requesterRole, roomId, start, end, title }) {
  const sid = Number(scheduleId);
  const idx = db.schedules.findIndex(s => s.id === sid);

  if (idx === -1) return { error: 'Agendamento não encontrado.', status: 404 };

  const existing = db.schedules[idx];

  if (requesterRole !== 'admin' && existing.userId !== requesterId) {
    return { error: 'Você não tem permissão para editar este agendamento.', status: 403 };
  }

  const newRoomId = roomId !== undefined ? Number(roomId) : existing.roomId;
  const newStart  = start  ?? existing.start;
  const newEnd    = end    ?? existing.end;
  const newTitle  = title  ?? existing.title;

  const dateError = validateDateRange(newStart, newEnd);
  if (dateError) return { error: dateError, status: 400 };

  if (!db.rooms.find(r => r.id === newRoomId)) {
    return { error: 'Sala não encontrada.', status: 404 };
  }
  if (checkRoomConflict(newRoomId, newStart, newEnd, sid)) {
    return { error: 'Conflito de horário: sala já reservada neste período.', status: 409 };
  }
  if (checkUserConflict(existing.userId, newStart, newEnd, sid)) {
    return { error: 'Conflito de horário: o funcionário já possui uma reserva neste período.', status: 409 };
  }

  db.schedules[idx] = { ...existing, roomId: newRoomId, start: newStart, end: newEnd, title: newTitle };
  return { data: db.schedules[idx] };
}

function deleteSchedule({ scheduleId, requesterId, requesterRole }) {
  const sid = Number(scheduleId);
  const idx = db.schedules.findIndex(s => s.id === sid);

  if (idx === -1) return { error: 'Agendamento não encontrado.', status: 404 };

  const existing = db.schedules[idx];

  if (requesterRole !== 'admin' && existing.userId !== requesterId) {
    return { error: 'Você não tem permissão para deletar este agendamento.', status: 403 };
  }

  db.schedules.splice(idx, 1);
  return { success: true };
}

function getSchedules() {
  return db.schedules;
}

function getSchedulesByRoom(roomId) {
  const id = Number(roomId);
  return db.schedules.filter(s => s.roomId === id);
}

module.exports = {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedules,
  getSchedulesByRoom,
};
