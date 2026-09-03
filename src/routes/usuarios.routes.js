import { Router } from 'express';
import { listar, obter, criar, atualizar, remover } from '../controllers/usuarios.controller.js';
import { validarUsuario } from '../middlewares/validacao.middleware.js';

const router = Router();

router.get('/', listar);
router.get('/:id', obter);
router.post('/', validarUsuario, criar); 
router.put('/:id', atualizar);
router.delete('/:id', remover);

export default router;