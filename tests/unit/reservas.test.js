const test = require('node:test');
const assert = require('node:assert/strict');
const { request } = require('../helpers/httpClient');

test('fluxo principal de autenticação, reservas e conflitos', async () => {
  const adminLogin = await request('POST', '/login', { email: 'admin@empresa.com', password: 'admin123' });
  assert.equal(adminLogin.status, 200);

  const funcionarioLogin = await request('POST', '/login', { email: 'joao@empresa.com', password: 'joao123' });
  assert.equal(funcionarioLogin.status, 200);

  const adminToken = adminLogin.body.token;
  const funcionarioToken = funcionarioLogin.body.token;

  const loginInvalido = await request('POST', '/login', { email: 'x@x.com', password: 'errada' });
  assert.equal(loginInvalido.status, 401);

  const semToken = await request('GET', '/salas');
  assert.equal(semToken.status, 401);

  const listarSalas = await request('GET', '/salas', null, adminToken);
  assert.equal(listarSalas.status, 200);

  const criarSala = await request('POST', '/criarSala', { name: 'Sala Gama', capacity: 8, location: 'Andar 3' }, adminToken);
  assert.equal(criarSala.status, 201);

  const criarSalaFuncionario = await request('POST', '/criarSala', { name: 'Sala X', capacity: 4, location: 'Andar 1' }, funcionarioToken);
  assert.equal(criarSalaFuncionario.status, 403);

  const reservaPrincipal = await request('POST', '/reservarSala', { roomId: 1, title: 'Sprint Planning', start: '2026-06-01T09:00:00', end: '2026-06-01T10:30:00' }, funcionarioToken);
  assert.equal(reservaPrincipal.status, 201);
  assert.equal(reservaPrincipal.body.userId, 2);

  const conflitoSala = await request('POST', '/reservarSala', { roomId: 1, title: 'Conflito', start: '2026-06-01T09:30:00', end: '2026-06-01T11:00:00' }, funcionarioToken);
  assert.equal(conflitoSala.status, 409);

  const conflitoUsuario = await request('POST', '/reservarSala', { roomId: 2, title: 'Conflito usuario', start: '2026-06-01T09:00:00', end: '2026-06-01T10:00:00' }, funcionarioToken);
  assert.equal(conflitoUsuario.status, 409);

  const dataPassado = await request('POST', '/reservarSala', { roomId: 1, title: 'Passado', start: '2020-01-01T09:00:00', end: '2020-01-01T10:00:00' }, funcionarioToken);
  assert.equal(dataPassado.status, 400);

  const duracaoMaiorQueOitoHoras = await request('POST', '/reservarSala', { roomId: 1, title: 'Longa', start: '2026-06-02T08:00:00', end: '2026-06-02T17:00:00' }, funcionarioToken);
  assert.equal(duracaoMaiorQueOitoHoras.status, 400);

  const antecedenciaAlta = await request('POST', '/reservarSala', { roomId: 1, title: 'Muito futuro', start: '2026-07-19T09:00:00', end: '2026-07-19T10:00:00' }, funcionarioToken);
  assert.equal(antecedenciaAlta.status, 400);

  const agenda = await request('GET', '/agenda', null, funcionarioToken);
  assert.equal(agenda.status, 200);

  const agendaSala = await request('GET', '/agenda/1', null, funcionarioToken);
  assert.equal(agendaSala.status, 200);

  const agendamentoAtualizado = await request('PUT', `/ajustarAgendamento/${reservaPrincipal.body.id}`, { title: 'Sprint Ajustado' }, funcionarioToken);
  assert.equal(agendamentoAtualizado.status, 200);

  const reservaAdmin = await request('POST', '/reservarSala', { roomId: 2, title: 'Reunião Maria', start: '2026-06-05T14:00:00', end: '2026-06-05T15:00:00' }, adminToken);
  assert.equal(reservaAdmin.status, 201);

  const editarReservaDeOutro = await request('PUT', `/ajustarAgendamento/${reservaAdmin.body.id}`, { title: 'Hacking' }, funcionarioToken);
  assert.equal(editarReservaDeOutro.status, 403);

  const deletarSalaComAgendamento = await request('DELETE', '/apagarSala/1', null, adminToken);
  assert.equal(deletarSalaComAgendamento.status, 400);

  const deletarSalaSemAgendamento = await request('DELETE', '/apagarSala/3', null, adminToken);
  assert.equal(deletarSalaSemAgendamento.status, 200);

  const deletarAgendamentoOutro = await request('DELETE', `/deletarAgendamento/${reservaAdmin.body.id}`, null, funcionarioToken);
  assert.equal(deletarAgendamentoOutro.status, 403);

  const deletarAgendamentoProprio = await request('DELETE', `/deletarAgendamento/${reservaPrincipal.body.id}`, null, funcionarioToken);
  assert.equal(deletarAgendamentoProprio.status, 200);

  const adminDeletaAgendamento = await request('DELETE', `/deletarAgendamento/${reservaAdmin.body.id}`, null, adminToken);
  assert.equal(adminDeletaAgendamento.status, 200);
});