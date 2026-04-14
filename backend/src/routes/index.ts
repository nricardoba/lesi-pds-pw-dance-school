import { Router } from "express";
import userRoutes from "./user.routes";

const router = Router();

// Rota de teste para garantir que a API está a responder
router.get('/', (req, res) => {
  res.json({ message: "Bem-vindo à API da Plataforma Ent'Artes! 💃🕺" });
});

router.use("/user", userRoutes);

export default router;