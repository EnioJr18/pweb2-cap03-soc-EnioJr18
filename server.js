// PONTO DE PARTIDA — API de usuários "monolítica" (tudo neste arquivo).
// Ela MISTURA quatro responsabilidades: roteamento, tratamento da requisição,
// validação e tratamento de erros. Sua tarefa é aplicar SEPARATION OF CONCERNS:
// separar cada responsabilidade em seu módulo (Router, Controller, Middlewares)
// SEM mudar o comportamento (o autograder confere as duas coisas). Veja o README.md.
import express from 'express';

const app = express();
app.use(express.json());

let usuarios = [
  { id: 1, nome: 'José', email: 'jose@exemplo.com' },
  { id: 2, nome: 'Maria', email: 'maria@exemplo.com' },
];
let proximoId = 3;

app.get('/', (req, res) => {
  res.json({ mensagem: 'API de usuários — Capítulo 3 (Express)' });
});

// Listar
app.get('/api/usuarios', (req, res) => {
  res.json(usuarios);
});

// Obter por id
app.get('/api/usuarios/:id', (req, res) => {
  const usuario = usuarios.find((u) => u.id === Number(req.params.id));
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.json(usuario);
});

// Criar (com validação inline)
app.post('/api/usuarios', (req, res) => {
  const { nome, email } = req.body ?? {};
  if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
    return res.status(400).json({ erro: 'Nome inválido (mínimo 2 caracteres)' });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ erro: 'E-mail inválido' });
  }
  const novo = { id: proximoId++, nome, email };
  usuarios.push(novo);
  res.status(201).json(novo);
});

// Atualizar
app.put('/api/usuarios/:id', (req, res) => {
  const usuario = usuarios.find((u) => u.id === Number(req.params.id));
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  const { nome, email } = req.body ?? {};
  if (nome) usuario.nome = nome;
  if (email) usuario.email = email;
  res.json(usuario);
});

// Remover
app.delete('/api/usuarios/:id', (req, res) => {
  const existe = usuarios.some((u) => u.id === Number(req.params.id));
  if (!existe) return res.status(404).json({ erro: 'Usuário não encontrado' });
  usuarios = usuarios.filter((u) => u.id !== Number(req.params.id));
  res.status(204).send();
});

// 404 para o resto
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));
