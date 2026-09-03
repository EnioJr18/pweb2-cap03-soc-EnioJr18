export function validarUsuario(req, res, next) {
  const { nome, email } = req.body ?? {};
  
  if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
    return res.status(400).json({ erro: 'Nome inválido (mínimo 2 caracteres)' });
  }
  
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ erro: 'E-mail inválido' });
  }
  
  next();
}