import express from 'express';
import usuariosRouter from './src/routes/usuarios.routes.js';
import { middlewareDeErro } from './src/middlewares/erro.middleware.js';

const app = express();
app.use(express.json());

// Rota raiz
app.get('/', (req, res) => {
  res.json({ mensagem: 'API de usuários — Capítulo 3 (Express)' });
});

// Monta o roteador de usuários
app.use('/api/usuarios', usuariosRouter);

// Handler de 404 para rotas inexistentes
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

// Tratamento de erros 
app.use(middlewareDeErro);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));