const db = require('../models/database');

function listRooms() {
  return db.rooms;
}

function createRoom({ name, capacity, location }) {
  const room = { id: db.getNextRoomId(), name, capacity, location };
  db.rooms.push(room);
  return room;
}

function deleteRoom(roomId) {
  const id = Number(roomId);
  const idx = db.rooms.findIndex(r => r.id === id);

  if (idx === -1) return { error: 'Sala não encontrada.', status: 404 };

  const hasSchedules = db.schedules.some(s => s.roomId === id);
  if (hasSchedules) {
    return { error: 'Sala possui agendamentos vinculados e não pode ser deletada.', status: 400 };
  }

  db.rooms.splice(idx, 1);
  return { success: true };
}

module.exports = { listRooms, createRoom, deleteRoom };
