// src/routes/classes.ts
import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

// listar aulas
router.get('/', async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        classStatus: true,
        schoolYear: true,
        studioModality: {
          include: {
            studio: true,
            modality: true,
          },
        },
        userClass: {
          include: {
            user: true,
            userClassRole: true,
          },
        },
      },
      orderBy: {
        classId: 'asc',
      },
    });

    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter aulas.' });
  }
});

// obter aula por id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const classItem = await prisma.class.findUnique({
      where: { classId: id },
      include: {
        classStatus: true,
        schoolYear: true,
        studioModality: {
          include: {
            studio: true,
            modality: true,
          },
        },
        userClass: {
          include: {
            user: true,
            userClassRole: true,
          },
        },
      },
    });

    if (!classItem) {
      return res.status(404).json({ error: 'Aula não encontrada.' });
    }

    res.json(classItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter aula.' });
  }
});

// criar aula
router.post('/', async (req, res) => {
  try {
    const {
      school_year_id,
      class_day,
      class_date_start,
      class_date_end,
      class_recurrence,
      studio_modality_id,
      class_final_fee,
      class_status_id,
    } = req.body;

    if (
      !school_year_id ||
      !class_day ||
      !class_date_start ||
      !class_date_end ||
      !studio_modality_id ||
      class_final_fee === undefined ||
      !class_status_id
    ) {
      return res.status(400).json({
        error:
          'Campos obrigatórios: school_year_id, class_day, class_date_start, class_date_end, studio_modality_id, class_final_fee, class_status_id',
      });
    }

    const lastClass = await prisma.class.findFirst({
      orderBy: { classId: 'desc' },
      select: { classId: true },
    });

    const nextId = (lastClass?.classId ?? 0) + 1;

    const created = await prisma.class.create({
      data: {
        classId: nextId,
        schoolYearId: Number(school_year_id),
        classDay: new Date(class_day),
        classTimeStart: new Date(`1970-01-01T${class_date_start}`),
        classTimeEnd: new Date(`1970-01-01T${class_date_end}`),
        classRecurrence:
          class_recurrence !== undefined ? Boolean(class_recurrence) : null,
        studioModalityId: Number(studio_modality_id),
        classFinalFee: Number(class_final_fee),
        classStatusId: Number(class_status_id),
      },
      include: {
        classStatus: true,
        schoolYear: true,
        studioModality: {
          include: {
            studio: true,
            modality: true,
          },
        },
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar aula.' });
  }
});

// inscrever utilizador numa aula
router.post('/:id/users', async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const { user_id, user_class_role_id, user_validation } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id é obrigatório.' });
    }

    const created = await prisma.userClass.create({
      data: {
        classId: classId,
        userId: Number(user_id),
        userClassRoleId:
          user_class_role_id !== undefined ? Number(user_class_role_id) : null,
        userValidation:
          user_validation !== undefined ? Boolean(user_validation) : false,
      },
      include: {
        user: true,
        class: true,
        userClassRole: true,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao associar utilizador à aula.' });
  }
});

// atualizar aula
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      school_year_id,
      class_day,
      class_date_start,
      class_date_end,
      class_recurrence,
      studio_modality_id,
      class_final_fee,
      class_status_id,
    } = req.body;

    const dataToUpdate: any = {};
    if (school_year_id) dataToUpdate.schoolYearId = Number(school_year_id);
    if (class_day) dataToUpdate.classDay = new Date(class_day);
    if (class_date_start) dataToUpdate.classTimeStart = new Date(`1970-01-01T${class_date_start}`);
    if (class_date_end) dataToUpdate.classTimeEnd = new Date(`1970-01-01T${class_date_end}`);
    if (class_recurrence !== undefined) dataToUpdate.classRecurrence = Boolean(class_recurrence);
    if (studio_modality_id) dataToUpdate.studioModalityId = Number(studio_modality_id);
    if (class_final_fee !== undefined) dataToUpdate.classFinalFee = Number(class_final_fee);
    if (class_status_id) dataToUpdate.classStatusId = Number(class_status_id);

    const updated = await prisma.class.update({
      where: { classId: id },
      data: dataToUpdate,
      include: {
        classStatus: true,
        schoolYear: true,
        studioModality: {
          include: { studio: true, modality: true },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar aula.' });
  }
});

// apagar/cancelar aula
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.class.delete({
      where: { classId: id },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao apagar aula. A aula já pode estar associada a utilizadores.' });
  }
});

// atualizar inscrição do utilizador à aula (estado/validação e papel)
router.put('/:id/users/:userId', async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const userId = Number(req.params.userId);
    const { user_class_role_id, user_validation } = req.body;

    const dataToUpdate: any = {};
    if (user_class_role_id !== undefined) dataToUpdate.userClassRoleId = Number(user_class_role_id);
    if (user_validation !== undefined) dataToUpdate.userValidation = Boolean(user_validation);

    const updated = await prisma.userClass.update({
      where: {
        classId_userId: { classId, userId },
      },
      data: dataToUpdate,
      include: {
        userClassRole: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar inscrição.' });
  }
});

// desinscrever utilizador
router.delete('/:id/users/:userId', async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const userId = Number(req.params.userId);

    await prisma.userClass.delete({
      where: {
        classId_userId: { classId, userId },
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover utilizador da aula.' });
  }
});

export default router;