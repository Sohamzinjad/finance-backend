const test = require('node:test');
const assert = require('node:assert/strict');
const { PassThrough, Readable, Writable } = require('node:stream');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/db');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const prismaMethods = {
  user: ['findUnique', 'create', 'findMany', 'count', 'update', 'delete', 'upsert'],
  transaction: ['create', 'findMany', 'findFirst', 'update', 'count'],
  $queryRaw: null,
};

const createStub = () => async () => {
  throw new Error('Unexpected Prisma call in test');
};

const resetPrismaMocks = () => {
  for (const [group, methods] of Object.entries(prismaMethods)) {
    if (methods === null) {
      prisma[group] = createStub();
      continue;
    }

    for (const method of methods) {
      prisma[group][method] = createStub();
    }
  }
};

const createRequest = ({ method = 'GET', path = '/', headers = {}, body } = {}) => {
  const payload = body ? JSON.stringify(body) : null;
  let sent = false;
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  );

  if (payload && !normalizedHeaders['content-type']) {
    normalizedHeaders['content-type'] = 'application/json';
  }

  if (payload) {
    normalizedHeaders['content-length'] = Buffer.byteLength(payload).toString();
  }

  const req = new Readable({
    read() {
      if (sent) {
        this.push(null);
        return;
      }

      sent = true;
      this.push(payload);
      this.push(null);
    },
  });

  req.method = method;
  req.url = path;
  req.originalUrl = path;
  req.path = path.split('?')[0];
  req.headers = normalizedHeaders;
  req.socket = new PassThrough();
  req.socket.remoteAddress = '127.0.0.1';
  req.socket.encrypted = false;
  req.connection = req.socket;
  req.httpVersion = '1.1';
  req.httpVersionMajor = 1;
  req.httpVersionMinor = 1;
  req.get = (name) => req.headers[name.toLowerCase()];

  Object.setPrototypeOf(req, app.request);

  return req;
};

const createResponse = () => {
  const chunks = [];
  const headers = {};

  const res = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      callback();
    },
  });

  res.statusCode = 200;
  res.locals = {};
  res.req = null;
  res.app = app;
  res.finished = false;
  res.headersSent = false;
  res.setHeader = (name, value) => {
    headers[name.toLowerCase()] = value;
  };
  res.getHeader = (name) => headers[name.toLowerCase()];
  res.removeHeader = (name) => {
    delete headers[name.toLowerCase()];
  };
  res.getHeaders = () => ({ ...headers });
  res.writeHead = (statusCode, reasonPhrase, extraHeaders) => {
    res.statusCode = statusCode;

    if (typeof reasonPhrase === 'object' && reasonPhrase !== null) {
      Object.entries(reasonPhrase).forEach(([key, value]) => res.setHeader(key, value));
    }

    if (typeof extraHeaders === 'object' && extraHeaders !== null) {
      Object.entries(extraHeaders).forEach(([key, value]) => res.setHeader(key, value));
    }

    res.headersSent = true;
    return res;
  };
  res.end = (chunk, encoding, callback) => {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    }

    res.finished = true;
    res.headersSent = true;

    if (typeof callback === 'function') {
      callback();
    }

    res.emit('finish');
    return res;
  };

  Object.setPrototypeOf(res, app.response);

  return {
    res,
    getBody: () => Buffer.concat(chunks).toString('utf8'),
    getHeaders: () => ({ ...headers }),
  };
};

const request = async ({ method = 'GET', path = '/', headers, body } = {}) => {
  const req = createRequest({ method, path, headers, body });
  const responseState = createResponse();
  responseState.res.req = req;

  await new Promise((resolve, reject) => {
    responseState.res.once('finish', resolve);
    responseState.res.once('error', reject);
    app.handle(req, responseState.res, reject);
  });

  const rawBody = responseState.getBody();

  return {
    status: responseState.res.statusCode,
    headers: responseState.getHeaders(),
    body: rawBody ? JSON.parse(rawBody) : null,
  };
};

test.beforeEach(() => {
  resetPrismaMocks();
});

test('health endpoint returns app status', async () => {
  const { status, body } = await request({ path: '/health' });

  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
  assert.ok(body.timestamp);
});

test('register always creates viewer accounts even if role is provided', async () => {
  prisma.user.findUnique = async () => null;
  prisma.user.create = async ({ data }) => ({
    id: 'user-1',
    name: data.name,
    email: data.email,
    role: data.role,
    status: 'ACTIVE',
    createdAt: new Date('2026-04-01T00:00:00.000Z'),
    updatedAt: new Date('2026-04-01T00:00:00.000Z'),
  });

  const { status, body } = await request({
    method: 'POST',
    path: '/api/auth/register',
    body: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1',
      role: 'ADMIN',
    },
  });

  assert.equal(status, 201);
  assert.equal(body.data.role, 'VIEWER');
});

test('login returns a signed JWT for active users', async () => {
  const passwordHash = await bcrypt.hash('Password1', 10);

  prisma.user.findUnique = async () => ({
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    passwordHash,
    role: 'VIEWER',
    status: 'ACTIVE',
  });

  const { status, body } = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: {
      email: 'test@example.com',
      password: 'Password1',
    },
  });

  assert.equal(status, 200);
  assert.ok(body.data.token);
  assert.equal(body.data.user.email, 'test@example.com');
});

test('viewer cannot create financial records', async () => {
  const token = jwt.sign(
    { userId: 'viewer-1', email: 'viewer@finance.com', role: 'VIEWER' },
    process.env.JWT_SECRET
  );

  const { status, body } = await request({
    method: 'POST',
    path: '/api/records',
    headers: {
      authorization: `Bearer ${token}`,
    },
    body: {
      amount: 100,
      type: 'INCOME',
      category: 'Salary',
      date: '2026-04-01T00:00:00.000Z',
    },
  });

  assert.equal(status, 403);
  assert.match(body.message, /insufficient permissions/i);
});

test('analyst cannot update another user record', async () => {
  prisma.transaction.findFirst = async () => ({
    id: 'record-1',
    userId: 'admin-1',
    amount: 100,
    type: 'EXPENSE',
    category: 'Rent',
    date: new Date('2026-04-01T00:00:00.000Z'),
    deletedAt: null,
  });

  const token = jwt.sign(
    { userId: 'analyst-1', email: 'analyst@finance.com', role: 'ANALYST' },
    process.env.JWT_SECRET
  );

  const { status, body } = await request({
    method: 'PATCH',
    path: '/api/records/record-1',
    headers: {
      authorization: `Bearer ${token}`,
    },
    body: { category: 'Utilities' },
  });

  assert.equal(status, 403);
  assert.match(body.message, /own records/i);
});

test('records listing returns paginated payload', async () => {
  prisma.transaction.findMany = async () => [
    {
      id: 'record-1',
      amount: { toString: () => '250.50' },
      type: 'INCOME',
      category: 'Consulting',
      date: new Date('2026-04-01T00:00:00.000Z'),
      notes: 'Invoice payment',
      userId: 'admin-1',
      deletedAt: null,
      createdAt: new Date('2026-04-01T00:00:00.000Z'),
      updatedAt: new Date('2026-04-01T00:00:00.000Z'),
    },
  ];
  prisma.transaction.count = async () => 1;

  const token = jwt.sign(
    { userId: 'viewer-1', email: 'viewer@finance.com', role: 'VIEWER' },
    process.env.JWT_SECRET
  );

  const { status, body } = await request({
    path: '/api/records?page=1&limit=10&type=INCOME',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  assert.equal(status, 200);
  assert.equal(body.data.total, 1);
  assert.equal(body.data.records[0].amount, 250.5);
  assert.equal(body.data.pagination.page, 1);
});

test('dashboard summary returns aggregated totals', async () => {
  prisma.$queryRaw = async () => [
    {
      totalIncome: { toString: () => '1000.00' },
      totalExpenses: { toString: () => '450.00' },
      totalTransactions: 6,
    },
  ];

  const token = jwt.sign(
    { userId: 'viewer-1', email: 'viewer@finance.com', role: 'VIEWER' },
    process.env.JWT_SECRET
  );

  const { status, body } = await request({
    path: '/api/dashboard/summary',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  assert.equal(status, 200);
  assert.deepEqual(body.data, {
    totalIncome: 1000,
    totalExpenses: 450,
    netBalance: 550,
    totalTransactions: 6,
  });
});

test('dashboard trends is restricted to analyst and admin roles', async () => {
  const token = jwt.sign(
    { userId: 'viewer-1', email: 'viewer@finance.com', role: 'VIEWER' },
    process.env.JWT_SECRET
  );

  const { status, body } = await request({
    path: '/api/dashboard/trends?year=2026',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  assert.equal(status, 403);
  assert.match(body.message, /insufficient permissions/i);
});
