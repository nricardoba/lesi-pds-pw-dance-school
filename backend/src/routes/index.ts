import { Router } from "express";
import usersRoutes from "./users.routes";

const router = Router();

// Rota de teste para garantir que a API está a responder
router.get('/', (req, res) => {
  res.json({ message: "Bem-vindo à API da Plataforma Ent'Artes! 💃🕺" });
});

router.use("/users", usersRoutes);

export default router;