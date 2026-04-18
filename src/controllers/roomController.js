const roomService = require('../services/roomService');

function listRooms(req, res) {
  return res.status(200).json(roomService.listRooms());
}

function createRoom(req, res) {
  const { name, capacity, location } = req.body;

  if (!name || !capacity || !location) {
    return res.status(400).json({ error: 'Nome, capacidade e localização são obrigatórios.' });
  }

  const room = roomService.createRoom({ name, capacity: Number(capacity), location });
  return res.status(201).json(room);
}

function deleteRoom(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID da sala é obrigatório.' });
  }

  const result = roomService.deleteRoom(id);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(200).json({ message: 'Sala deletada com sucesso.' });
}

module.exports = { listRooms, createRoom, deleteRoom };
