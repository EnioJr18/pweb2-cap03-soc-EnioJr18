import express from 'express';
import usuariosRouter from './src/routes/usuarios.routes.js';

const app = express();
app.use(express.json());

// Rota raiz 
app.get('/', (req, res) => {
  res.json({ mensagem: 'API de usuários — Capítulo 3 (Express)' });
});

// Monta o router: todas as requisições para /api/usuarios vão para o nosso novo arquivo
app.use('/api/usuarios', usuariosRouter);

// 404 para o resto
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));