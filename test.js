// Script de smoke tests — não é suite de testes formal, apenas validação manual
const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on('error', (e) => resolve({ status: 0, body: { error: e.message } }));
    if (data) req.write(data);
    req.end();
  });
}

function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? '✓' : '✗'} [${actual}] ${label}${ok ? '' : ` — esperado ${expected}`}`);
}

async function run() {
  // Login válido
  let r = await request('POST', '/login', { email: 'admin@empresa.com', password: 'admin123' });
  check('Login admin', r.status, 200);
  const ADMIN = r.body.token;

  r = await request('POST', '/login', { email: 'joao@empresa.com', password: 'joao123' });
  check('Login funcionario', r.status, 200);
  const FUNC = r.body.token;

  // Credenciais erradas
  r = await request('POST', '/login', { email: 'x@x.com', password: 'errada' });
  check('Login inválido → 401', r.status, 401);

  // Sem token
  r = await request('GET', '/salas', null, null);
  check('Sem token → 401', r.status, 401);

  // Listar salas
  r = await request('GET', '/salas', null, ADMIN);
  check('Listar salas → 200', r.status, 200);

  // Criar sala (admin)
  r = await request('POST', '/criarSala', { name: 'Sala Gama', capacity: 8, location: 'Andar 3' }, ADMIN);
  check('Criar sala (admin) → 201', r.status, 201);

  // Criar sala (funcionario) — proibido
  r = await request('POST', '/criarSala', { name: 'Sala X', capacity: 4, location: 'Andar 1' }, FUNC);
  check('Criar sala (funcionario) → 403', r.status, 403);

  // Reservar sala
  r = await request('POST', '/reservarSala', { roomId: 1, title: 'Sprint Planning', start: '2026-06-01T09:00:00', end: '2026-06-01T10:30:00' }, FUNC);
  check('Reservar sala → 201', r.status, 201);
  const SCHED_ID = r.body.id;

  // Conflito de sala (mesmo horário, mesma sala)
  r = await request('POST', '/reservarSala', { roomId: 1, title: 'Conflito', start: '2026-06-01T09:30:00', end: '2026-06-01T11:00:00' }, FUNC);
  check('Conflito de sala → 409', r.status, 409);

  // Conflito de usuário (mesmo horário, sala diferente)
  r = await request('POST', '/reservarSala', { roomId: 2, title: 'Conflito usuario', start: '2026-06-01T09:00:00', end: '2026-06-01T10:00:00' }, FUNC);
  check('Conflito de usuário → 409', r.status, 409);

  // Data no passado
  r = await request('POST', '/reservarSala', { roomId: 1, title: 'Passado', start: '2020-01-01T09:00:00', end: '2020-01-01T10:00:00' }, FUNC);
  check('Data no passado → 400', r.status, 400);

  // Duração > 8h
  r = await request('POST', '/reservarSala', { roomId: 1, title: 'Longa', start: '2026-06-02T08:00:00', end: '2026-06-02T17:00:00' }, FUNC);
  check('Duração > 8h → 400', r.status, 400);

  // Antecedência > 90 dias (mais de 90 dias no futuro a partir de hoje 2026-04-18)
  r = await request('POST', '/reservarSala', { roomId: 1, title: 'Muito futuro', start: '2026-07-19T09:00:00', end: '2026-07-19T10:00:00' }, FUNC);
  check('Antecedência > 90 dias → 400', r.status, 400);

  // Listar agenda
  r = await request('GET', '/agenda', null, FUNC);
  check('Listar agenda → 200', r.status, 200);

  // Listar agenda por sala
  r = await request('GET', '/agenda/1', null, FUNC);
  check('Agenda por sala → 200', r.status, 200);

  // Ajustar agendamento (dono)
  r = await request('PUT', `/ajustarAgendamento/${SCHED_ID}`, { title: 'Sprint Ajustado' }, FUNC);
  check('Ajustar agendamento (dono) → 200', r.status, 200);

  // Ajustar agendamento de outro usuário como funcionário (deve falhar)
  r = await request('POST', '/reservarSala', { roomId: 2, title: 'Reunião Maria', start: '2026-06-05T14:00:00', end: '2026-06-05T15:00:00' }, ADMIN);
  const OTHER_SCHED = r.body.id;
  r = await request('PUT', `/ajustarAgendamento/${OTHER_SCHED}`, { title: 'Hacking' }, FUNC);
  check('Ajustar agendamento de outro → 403', r.status, 403);

  // Deletar sala com agendamento (deve falhar)
  r = await request('DELETE', '/apagarSala/1', null, ADMIN);
  check('Deletar sala com agendamento → 400', r.status, 400);

  // Deletar sala sem agendamento
  r = await request('DELETE', '/apagarSala/3', null, ADMIN);
  check('Deletar sala sem agendamento → 200', r.status, 200);

  // Deletar agendamento de outro como funcionario
  r = await request('DELETE', `/deletarAgendamento/${OTHER_SCHED}`, null, FUNC);
  check('Deletar agendamento de outro → 403', r.status, 403);

  // Deletar agendamento próprio
  r = await request('DELETE', `/deletarAgendamento/${SCHED_ID}`, null, FUNC);
  check('Deletar agendamento próprio → 200', r.status, 200);

  // Admin deleta qualquer agendamento
  r = await request('DELETE', `/deletarAgendamento/${OTHER_SCHED}`, null, ADMIN);
  check('Admin deleta qualquer agendamento → 200', r.status, 200);

  console.log('\nTestes concluídos.');
  process.exit(0);
}

run().catch(console.error);
