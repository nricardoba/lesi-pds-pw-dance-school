// src/routes/reference.ts
import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

router.get('/user-types', async (req, res) => {
  try {
    const data = await prisma.userType.findMany({
      orderBy: { userTypeId: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter tipos de utilizador.' });
  }
});

router.get('/class-statuses', async (req, res) => {
  try {
    const data = await prisma.classStatus.findMany({
      orderBy: { classStatusId: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter estados da aula.' });
  }
});

router.get('/user-class-roles', async (req, res) => {
  try {
    const data = await prisma.userClassRole.findMany({
      orderBy: { userClassRoleId: 'asc' },
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
      orderBy: { modalityId: 'asc' },
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
      orderBy: { studioId: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter estúdios.' });
  }
});

router.get('/school-years', async (req, res) => {
  try {
    const data = await prisma.schoolYear.findMany({
      orderBy: { schoolYearId: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter anos letivos.' });
  }
});

router.get('/studio-modalities', async (req, res) => {
  try {
    const data = await prisma.studioModality.findMany({
      include: {
        studio: true,
        modality: true,
      },
      orderBy: { studioModalityId: 'asc' },
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter studio-modalities.' });
  }
});

export default router;