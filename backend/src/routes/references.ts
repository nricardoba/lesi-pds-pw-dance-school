// src/routes/reference.ts
import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

router.get('/user-types', async (req, res) => {
  try {
    const data = await prisma.user_Type.findMany({
      orderBy: { user_type_id: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter tipos de utilizador.' });
  }
});

router.get('/class-statuses', async (req, res) => {
  try {
    const data = await prisma.class_Status.findMany({
      orderBy: { class_status_id: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter estados da aula.' });
  }
});

router.get('/user-class-roles', async (req, res) => {
  try {
    const data = await prisma.user_Class_Role.findMany({
      orderBy: { user_class_role_id: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter papéis de aula.' });
  }
});

router.get('/modalities', async (req, res) => {
  try {
    const data = await prisma.modality.findMany({
      orderBy: { modality_id: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter modalidades.' });
  }
});

router.get('/studios', async (req, res) => {
  try {
    const data = await prisma.studio.findMany({
      orderBy: { studio_id: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter estúdios.' });
  }
});

router.get('/school-years', async (req, res) => {
  try {
    const data = await prisma.school_Year.findMany({
      orderBy: { school_year_id: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter anos letivos.' });
  }
});

router.get('/studio-modalities', async (req, res) => {
  try {
    const data = await prisma.studio_Modality.findMany({
      include: {
        Studio: true,
        Modality: true,
      },
      orderBy: { studio_modality_id: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter studio-modalities.' });
  }
});

export default router;