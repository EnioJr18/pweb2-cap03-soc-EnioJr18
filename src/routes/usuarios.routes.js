import { Router } from 'express';

const router = Router();

let usuarios = [
  { id: 1, nome: 'José', email: 'jose@exemplo.com' },
  { id: 2, nome: 'Maria', email: 'maria@exemplo.com' },
];
let proximoId = 3;

router.get('/', (req, res) => {
  res.json(usuarios);
});

router.get('/:id', (req, res) => {
  const usuario = usuarios.find((u) => u.id === Number(req.params.id));
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.json(usuario);
});

router.post('/', (req, res) => {
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

router.put('/:id', (req, res) => {
  const usuario = usuarios.find((u) => u.id === Number(req.params.id));
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  const { nome, email } = req.body ?? {};
  if (nome) usuario.nome = nome;
  if (email) usuario.email = email;
  res.json(usuario);
});

router.delete('/:id', (req, res) => {
  const existe = usuarios.some((u) => u.id === Number(req.params.id));
  if (!existe) return res.status(404).json({ erro: 'Usuário não encontrado' });
  usuarios = usuarios.filter((u) => u.id !== Number(req.params.id));
  res.status(204).send();
});

export default router;