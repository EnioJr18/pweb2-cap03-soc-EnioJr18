export function middlewareDeErro(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({ erro: err.message || 'Erro no Servidor' });
}