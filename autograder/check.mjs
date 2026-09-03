#!/usr/bin/env node
/**
 * Autograder — Atividade Cap. 3: refatoração para Router + Controller + Middlewares.
 * ATIVIDADE FORMATIVA (sem nota). Duas camadas:
 *   1) ESTRUTURA  — lê os arquivos e confere que a arquitetura foi extraída.
 *   2) COMPORTAMENTO — bate na API (BASE_URL) e confere que continua funcionando.
 *
 *   BASE_URL=http://localhost:3000 node autograder/check.mjs
 *
 * Node 18+ (fetch global). Sem dependências. No GitHub Actions, escreve o
 * resultado no resumo do job.
 */
import fs from 'node:fs';
import path from 'node:path';

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const RAIZ = process.cwd();

// ── Carrega os fontes (server.js + src/**/*.js), ignorando node_modules ──
function listarJs(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listarJs(p));
    else if (e.name.endsWith('.js') || e.name.endsWith('.mjs')) out.push(p);
  }
  return out;
}
const arquivos = {};
for (const p of listarJs(RAIZ)) {
  if (p.includes(`${path.sep}autograder${path.sep}`)) continue;
  arquivos[path.relative(RAIZ, p).split(path.sep).join('/')] = fs.readFileSync(p, 'utf8');
}
const existe = (re) => Object.keys(arquivos).some((k) => re.test(k));
const conteudoDe = (re) =>
  Object.entries(arquivos).filter(([k]) => re.test(k)).map(([, v]) => v).join('\n');
const entryFiles = () =>
  Object.entries(arquivos)
    .filter(([k]) => k === 'server.js' || k === 'src/app.js' || k === 'app.js')
    .map(([, v]) => v).join('\n');

const checks = [];
const check = (grupo, nome, pontos, fn) => checks.push({ grupo, nome, pontos, fn });
const assert = (c, m) => { if (!c) throw new Error(m); };

// ───────────────────────── ESTRUTURA ─────────────────────────
check('ESTRUTURA', 'Router em src/routes/*.js (express.Router + métodos)', 12, () => {
  assert(existe(/^src\/routes\/.*\.js$/), 'crie src/routes/usuarios.routes.js');
  const c = conteudoDe(/^src\/routes\/.*\.js$/);
  assert(/Router\s*\(/.test(c), 'as rotas devem usar express.Router()');
  assert(/\.(get|post|put|delete)\s*\(/.test(c), 'defina as rotas (get/post/put/delete) no Router');
});

check('ESTRUTURA', 'Controller em src/controllers/*.js (usado pelas rotas)', 12, () => {
  assert(existe(/^src\/controllers\/.*\.js$/), 'crie src/controllers/usuarios.controller.js');
  const ctrl = conteudoDe(/^src\/controllers\/.*\.js$/);
  assert(/export\s+(const|function|default|\{)/.test(ctrl), 'o controller deve exportar as funções (handlers)');
  const rotas = conteudoDe(/^src\/routes\/.*\.js$/);
  assert(/controller/i.test(rotas), 'as rotas devem importar/usar o controller');
});

check('ESTRUTURA', 'Middleware de validação (usado nas rotas)', 10, () => {
  assert(existe(/^src\/middlewares?\/.*valid.*\.js$/i), 'crie src/middlewares/validacao.middleware.js');
  const rotas = conteudoDe(/^src\/routes\/.*\.js$/);
  assert(/valid/i.test(rotas), 'aplique o middleware de validação na rota de criação (POST)');
});

check('ESTRUTURA', 'Middleware de erros (4 parâmetros: err, req, res, next)', 11, () => {
  const mws = conteudoDe(/^src\/middlewares?\/.*\.js$/i);
  assert(/\(\s*err\s*,\s*req\s*,\s*res\s*,\s*next\s*\)/.test(mws),
    'crie um middleware de erros com a assinatura (err, req, res, next)');
});

check('ESTRUTURA', 'Entrada monta o Router e não tem CRUD inline', 10, () => {
  const entry = entryFiles();
  assert(/app\.use\s*\(/.test(entry) && /rout/i.test(entry),
    'o app deve montar o router com app.use(...)');
  assert(!/app\.(get|post|put|delete)\s*\(\s*['"`]\/(api\/)?usuarios/i.test(entry),
    'as rotas de /usuarios não devem mais estar inline no server.js/app.js');
});

// ─────────────────────── COMPORTAMENTO ───────────────────────
async function req(method, p, body) {
  const opt = { method, headers: {} };
  if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
  const res = await fetch(BASE + p, opt);
  let json = null; try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

check('COMPORTAMENTO', 'GET /api/usuarios → 200 e array', 5, async () => {
  const r = await req('GET', '/api/usuarios');
  assert(r.status === 200, `status ${r.status}`);
  assert(Array.isArray(r.json), 'deve retornar um array');
});
check('COMPORTAMENTO', 'POST /api/usuarios válido → 201 com id', 6, async () => {
  const r = await req('POST', '/api/usuarios', { nome: 'Ana Teste', email: 'ana@ex.com' });
  assert(r.status === 201, `status ${r.status}`);
  assert(r.json && typeof r.json.id !== 'undefined', 'resposta deve conter id');
});
check('COMPORTAMENTO', 'POST nome inválido → 400', 5, async () => {
  const r = await req('POST', '/api/usuarios', { nome: 'A', email: 'a@ex.com' });
  assert(r.status === 400, `status ${r.status}`);
});
check('COMPORTAMENTO', 'POST e-mail inválido → 400', 5, async () => {
  const r = await req('POST', '/api/usuarios', { nome: 'Bruno', email: 'sem-arroba' });
  assert(r.status === 400, `status ${r.status}`);
});
check('COMPORTAMENTO', 'GET /api/usuarios/:id → 200', 5, async () => {
  const novo = await req('POST', '/api/usuarios', { nome: 'Carla', email: 'carla@ex.com' });
  const r = await req('GET', `/api/usuarios/${novo.json.id}`);
  assert(r.status === 200 && r.json.id === novo.json.id, `status ${r.status}`);
});
check('COMPORTAMENTO', 'GET id inexistente → 404', 4, async () => {
  const r = await req('GET', '/api/usuarios/999999');
  assert(r.status === 404, `status ${r.status}`);
});
check('COMPORTAMENTO', 'PUT /api/usuarios/:id → 200 atualizado', 5, async () => {
  const novo = await req('POST', '/api/usuarios', { nome: 'Davi', email: 'davi@ex.com' });
  const r = await req('PUT', `/api/usuarios/${novo.json.id}`, { nome: 'Davi Silva' });
  assert(r.status === 200 && r.json.nome === 'Davi Silva', `status ${r.status} nome ${r.json?.nome}`);
});
check('COMPORTAMENTO', 'DELETE /api/usuarios/:id → 204 e depois 404', 6, async () => {
  const novo = await req('POST', '/api/usuarios', { nome: 'Elis', email: 'elis@ex.com' });
  const del = await req('DELETE', `/api/usuarios/${novo.json.id}`);
  assert(del.status === 204, `DELETE status ${del.status}`);
  const dep = await req('GET', `/api/usuarios/${novo.json.id}`);
  assert(dep.status === 404, `após remover, GET deveria dar 404 (veio ${dep.status})`);
});
check('COMPORTAMENTO', 'Rota inexistente → 404', 4, async () => {
  const r = await req('GET', '/api/nao-existe');
  assert(r.status === 404, `status ${r.status}`);
});

// ───────────────────────── execução ─────────────────────────
async function main() {
  // servidor no ar? (só afeta a camada de comportamento)
  let servidorOk = true;
  try { await fetch(BASE + '/api/usuarios'); } catch { servidorOk = false; }

  let obtido = 0, total = 0;
  const linhas = [];
  for (const c of checks) {
    total += c.pontos;
    if (c.grupo === 'COMPORTAMENTO' && !servidorOk) {
      linhas.push({ ok: false, grupo: c.grupo, nome: c.nome, pontos: c.pontos, detalhe: 'servidor não respondeu em ' + BASE });
      continue;
    }
    try { await c.fn(); obtido += c.pontos; linhas.push({ ok: true, grupo: c.grupo, nome: c.nome, pontos: c.pontos, detalhe: '' }); }
    catch (e) { linhas.push({ ok: false, grupo: c.grupo, nome: c.nome, pontos: c.pontos, detalhe: e.message }); }
  }

  const pct = total ? Math.round((obtido / total) * 100) : 0;
  console.log(`\nAutograder — Cap. 3 (refatoração) · BASE_URL: ${BASE}\n`);
  let grupoAtual = '';
  for (const l of linhas) {
    if (l.grupo !== grupoAtual) { grupoAtual = l.grupo; console.log(`— ${grupoAtual} —`); }
    console.log(`${l.ok ? '✓' : '✗'} [${String(l.ok ? l.pontos : 0).padStart(2)}/${l.pontos}] ${l.nome}`);
    if (!l.ok) console.log(`      ↳ ${l.detalhe}`);
  }
  console.log(`\nNOTA (formativa): ${obtido}/${total}  (${pct}%)\n`);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const md = [
      pct === 100 ? '## ✅ Refatoração completa!' : `## Autograder — Cap. 3 (refatoração) · ${obtido}/${total} (${pct}%)`,
      '', '| | Camada | Item | Pontos |', '|---|---|---|---|',
      ...linhas.map((l) => `| ${l.ok ? '✅' : '❌'} | ${l.grupo} | ${l.nome}${l.ok ? '' : ' — ' + l.detalhe} | ${l.ok ? l.pontos : 0}/${l.pontos} |`),
      '', '> Atividade **formativa** (sem nota). Refatore em passos, um commit por etapa (ver `COMMITS.md`).',
    ].join('\n');
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n');
  }
  process.exit(pct === 100 ? 0 : 1);
}
main();
