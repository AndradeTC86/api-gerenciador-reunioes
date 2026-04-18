// Banco de dados em memória — simula persistência com Arrays/Objects
const users = [
  { id: 1, name: 'Admin Empresa', email: 'admin@empresa.com', password: 'admin123', role: 'admin' },
  { id: 2, name: 'João Silva', email: 'joao@empresa.com', password: 'joao123', role: 'funcionario' },
  { id: 3, name: 'Maria Souza', email: 'maria@empresa.com', password: 'maria123', role: 'funcionario' },
];

const rooms = [
  { id: 1, name: 'Sala Alpha', capacity: 10, location: 'Andar 1' },
  { id: 2, name: 'Sala Beta', capacity: 6, location: 'Andar 2' },
];

const schedules = [];

let nextRoomId = 3;
let nextScheduleId = 1;

module.exports = {
  users,
  rooms,
  schedules,
  getNextRoomId: () => nextRoomId++,
  getNextScheduleId: () => nextScheduleId++,
};
