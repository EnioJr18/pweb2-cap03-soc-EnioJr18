import { Router } from "express";
import {
  listar,
  obter,
  criar,
  atualizar,
  remover,
} from "../controllers/usuarios.controller.js";

const router = Router();

router.get("/", listar);
router.get("/:id", obter);
router.post("/", criar);
router.put("/:id", atualizar);
router.delete("/:id", remover);

export default router;
