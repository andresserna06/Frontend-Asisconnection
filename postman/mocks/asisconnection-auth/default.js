/**
 * ASISCONNECTION auth mock (contract: docs/api-auth.md).
 *
 * Generated with `postman mock generate` and then rewritten by hand so it behaves like the
 * backend: it validates credentials, issues one token per user and enforces roles.
 * Do NOT run `postman mock generate --update` on it: that would overwrite this logic.
 *
 * All accounts are fictitious test data. Never put real Foundation data here.
 */
const http = require('http');

const PORT = process.env.PORT || 4500;

const MIN_PASSWORD_LENGTH = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PUBLIC_SIGNUP_ROLES = ['ACUDIENTE', 'DONANTE'];
const ADMIN_CREATED_ROLES = ['ESTUDIANTE', 'TALLERISTA', 'ADMIN'];

// Seed accounts, one per role. Registered users are added at runtime (in memory).
const users = [
  {
    username: 'maria.acudiente',
    email: 'maria@prueba.com',
    clave: 'ClaveAcudiente2026',
    roles: ['ACUDIENTE'],
  },
  {
    username: 'carlos.donante',
    email: 'carlos@prueba.com',
    clave: 'ClaveDonante2026',
    roles: ['DONANTE'],
  },
  {
    username: 'ana.tallerista',
    email: 'ana@prueba.com',
    clave: 'ClaveTallerista2026',
    roles: ['TALLERISTA'],
  },
  {
    username: 'juan.estudiante',
    email: 'juan@prueba.com',
    clave: 'ClaveEstudiante2026',
    roles: ['ESTUDIANTE'],
  },
  {
    username: 'admin.asisco',
    email: 'admin@prueba.com',
    clave: 'ClaveAdmin2026',
    roles: ['ADMIN'],
  },
];

// Deterministic tokens: the same user always gets the same token, so a restarted mock
// still accepts a token the app saved earlier.
const tokenOf = (user) => `mock-token-${user.username}`;
const findByEmail = (email) =>
  users.find((user) => user.email === String(email).trim().toLowerCase());
const findByToken = (token) => users.find((user) => tokenOf(user) === token);
const publicProfile = (user) => ({ username: user.username, email: user.email, roles: user.roles });

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...CORS_HEADERS });
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve(null);
      }
    });
  });
}

function bearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
}

// The backend rejects missing fields and any extra field. Returns field errors or null.
function checkFields(body, allowed) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { body: 'El cuerpo debe ser un objeto JSON' };
  }
  const errores = {};
  for (const field of allowed) {
    if (body[field] === undefined || body[field] === '') {
      errores[field] = 'Campo obligatorio';
    }
  }
  for (const field of Object.keys(body)) {
    if (!allowed.includes(field)) {
      errores[field] = 'Campo no permitido';
    }
  }
  return Object.keys(errores).length > 0 ? errores : null;
}

// Shared rules for creating an account (public sign-up and admin creation).
function checkNewAccount({ username, email, clave }) {
  const errores = {};
  if (!EMAIL_PATTERN.test(String(email))) {
    errores.email = 'El correo no es válido';
  }
  if (String(clave).length < MIN_PASSWORD_LENGTH) {
    errores.clave = `La clave debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
  }
  if (Object.keys(errores).length > 0) {
    return { status: 400, body: { errores } };
  }
  const isTaken = users.some(
    (user) => user.username === username || user.email === String(email).trim().toLowerCase(),
  );
  if (isTaken) {
    return { status: 409, body: { mensaje: 'El usuario o el correo ya está registrado' } };
  }
  return null;
}

function createAccount({ username, email, clave }, roles) {
  const user = { username, email: String(email).trim().toLowerCase(), clave, roles };
  users.push(user);
  return user;
}

async function handleLogin(req, res) {
  const body = await readJsonBody(req);
  const errores = checkFields(body, ['email', 'clave']);
  if (errores) {
    return send(res, 400, { errores });
  }
  const user = findByEmail(body.email);
  if (!user || user.clave !== body.clave) {
    return send(res, 401, { mensaje: 'Credenciales inválidas' });
  }
  return send(res, 200, { token: tokenOf(user), roles: user.roles });
}

function handleProfile(req, res) {
  const user = findByToken(bearerToken(req));
  if (!user) {
    return send(res, 401, { mensaje: 'Token inválido o expirado' });
  }
  return send(res, 200, publicProfile(user));
}

function handleLogout(req, res) {
  if (!findByToken(bearerToken(req))) {
    return send(res, 401, { mensaje: 'Token inválido o expirado' });
  }
  return send(res, 200, { mensaje: 'Sesión cerrada' });
}

async function handleSignUp(req, res) {
  const body = await readJsonBody(req);
  const errores = checkFields(body, ['username', 'email', 'clave', 'rol']);
  if (errores) {
    return send(res, 400, { errores });
  }
  if (!PUBLIC_SIGNUP_ROLES.includes(body.rol)) {
    return send(res, 400, { errores: { rol: 'Solo se permite ACUDIENTE o DONANTE' } });
  }
  const problem = checkNewAccount(body);
  if (problem) {
    return send(res, problem.status, problem.body);
  }
  return send(res, 201, publicProfile(createAccount(body, [body.rol])));
}

async function handleCreateUser(req, res) {
  const caller = findByToken(bearerToken(req));
  if (!caller) {
    return send(res, 401, { mensaje: 'Token inválido o expirado' });
  }
  if (!caller.roles.includes('ADMIN')) {
    return send(res, 403, { mensaje: 'No tienes permisos para esta acción' });
  }
  const body = await readJsonBody(req);
  const errores = checkFields(body, ['username', 'email', 'clave', 'roles']);
  if (errores) {
    return send(res, 400, { errores });
  }
  const roles = Array.isArray(body.roles) ? body.roles : [];
  if (roles.length === 0 || !roles.every((role) => ADMIN_CREATED_ROLES.includes(role))) {
    return send(res, 400, { errores: { roles: 'Solo se permite ESTUDIANTE, TALLERISTA o ADMIN' } });
  }
  const problem = checkNewAccount(body);
  if (problem) {
    return send(res, problem.status, problem.body);
  }
  return send(res, 201, publicProfile(createAccount(body, roles)));
}

const ROUTES = {
  'POST /auth/login': handleLogin,
  'GET /auth/perfil': handleProfile,
  'POST /auth/logout': handleLogout,
  'POST /auth/registro': handleSignUp,
  'POST /auth/usuarios': handleCreateUser,
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }
  const { pathname } = new URL(req.url || '', 'http://localhost');
  const handler = ROUTES[`${req.method} ${pathname}`];
  if (!handler) {
    return send(res, 404, { mensaje: 'Endpoint no definido' });
  }
  return handler(req, res);
});

server.listen(PORT);
