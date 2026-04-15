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

// POST /school-years
router.post('/school-years', async (req, res) => {
  try {
    const { school_year_name, school_year_start, school_year_end } = req.body;
    if (!school_year_name || !school_year_start || !school_year_end) {
      return res.status(400).json({ error: 'Campos obrigatórios: school_year_name, school_year_start, school_year_end' });
    }
    const last = await prisma.schoolYear.findFirst({ orderBy: { schoolYearId: 'desc' } });
    const created = await prisma.schoolYear.create({
      data: {
        schoolYearId: (last?.schoolYearId ?? 0) + 1,
        schoolYearName: school_year_name,
        schoolYearStart: new Date(school_year_start),
        schoolYearEnd: new Date(school_year_end)
      },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar ano letivo.' });
  }
});

// POST /class-statuses
router.post('/class-statuses', async (req, res) => {
  try {
    const { class_status_desc } = req.body;
    if (!class_status_desc) return res.status(400).json({ error: 'O campo class_status_desc é obrigatório.' });
    const last = await prisma.classStatus.findFirst({ orderBy: { classStatusId: 'desc' } });
    const created = await prisma.classStatus.create({
      data: { classStatusId: (last?.classStatusId ?? 0) + 1, classStatusDesc: class_status_desc },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar estado da aula.' });
  }
});

// POST /modalities
router.post('/modalities', async (req, res) => {
  try {
    const { modality_name, modality_hourly_fee } = req.body;
    if (!modality_name || modality_hourly_fee === undefined) return res.status(400).json({ error: 'Campos obrigatórios: modality_name, modality_hourly_fee' });
    const last = await prisma.modality.findFirst({ orderBy: { modalityId: 'desc' } });
    const created = await prisma.modality.create({
      data: { modalityId: (last?.modalityId ?? 0) + 1, modalityName: modality_name, modalityHourlyFee: Number(modality_hourly_fee) },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar modalidade.' });
  }
});

// POST /studios
router.post('/studios', async (req, res) => {
  try {
    const { studio_name, studio_max_capacity } = req.body;
    if (!studio_name || studio_max_capacity === undefined) return res.status(400).json({ error: 'Campos obrigatórios: studio_name, studio_max_capacity' });
    const last = await prisma.studio.findFirst({ orderBy: { studioId: 'desc' } });
    const created = await prisma.studio.create({
      data: { studioId: (last?.studioId ?? 0) + 1, studioName: studio_name, studioMaxCapacity: Number(studio_max_capacity) },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar estúdio.' });
  }
});

// POST /studio-modalities
router.post('/studio-modalities', async (req, res) => {
  try {
    const { studio_id, modality_id } = req.body;
    if (!studio_id || !modality_id) return res.status(400).json({ error: 'Campos obrigatórios: studio_id, modality_id' });
    const last = await prisma.studioModality.findFirst({ orderBy: { studioModalityId: 'desc' } });
    const created = await prisma.studioModality.create({
      data: { studioModalityId: (last?.studioModalityId ?? 0) + 1, studioId: Number(studio_id), modalityId: Number(modality_id) },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao associar estúdio e modalidade.' });
  }
});

// POST /user-class-roles
router.post('/user-class-roles', async (req, res) => {
  try {
    const { user_class_role_desc } = req.body;
    if (!user_class_role_desc) return res.status(400).json({ error: 'O campo user_class_role_desc é obrigatório.' });
    const last = await prisma.userClassRole.findFirst({ orderBy: { userClassRoleId: 'desc' } });
    const created = await prisma.userClassRole.create({
      data: { userClassRoleId: (last?.userClassRoleId ?? 0) + 1, userClassRoleDesc: user_class_role_desc },
    });
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar papel de aula.' });
  }
});

export default router;