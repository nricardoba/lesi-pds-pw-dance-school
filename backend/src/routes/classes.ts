// src/routes/classes.ts
import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

// listar aulas
router.get('/', async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        Class_Status: true,
        School_Year: true,
        Studio_Modality: {
          include: {
            Studio: true,
            Modality: true,
          },
        },
        User_Class: {
          include: {
            User: true,
            User_Class_Role: true,
          },
        },
      },
      orderBy: {
        class_id: 'asc',
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
      where: { class_id: id },
      include: {
        Class_Status: true,
        School_Year: true,
        Studio_Modality: {
          include: {
            Studio: true,
            Modality: true,
          },
        },
        User_Class: {
          include: {
            User: true,
            User_Class_Role: true,
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
      orderBy: { class_id: 'desc' },
      select: { class_id: true },
    });

    const nextId = (lastClass?.class_id ?? 0) + 1;

    const created = await prisma.class.create({
      data: {
        class_id: nextId,
        school_year_id: Number(school_year_id),
        class_day: new Date(class_day),
        class_date_start: new Date(`1970-01-01T${class_date_start}`),
        class_date_end: new Date(`1970-01-01T${class_date_end}`),
        class_recurrence:
          class_recurrence !== undefined ? Boolean(class_recurrence) : null,
        studio_modality_id: Number(studio_modality_id),
        class_final_fee: Number(class_final_fee),
        class_status_id: Number(class_status_id),
      },
      include: {
        Class_Status: true,
        School_Year: true,
        Studio_Modality: {
          include: {
            Studio: true,
            Modality: true,
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

    const created = await prisma.user_Class.create({
      data: {
        class_id: classId,
        user_id: Number(user_id),
        user_class_role_id:
          user_class_role_id !== undefined ? Number(user_class_role_id) : null,
        user_validation:
          user_validation !== undefined ? Boolean(user_validation) : false,
      },
      include: {
        User: true,
        Class: true,
        User_Class_Role: true,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao associar utilizador à aula.' });
  }
});

export default router;