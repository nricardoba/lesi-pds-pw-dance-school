// src/routes/users.ts
import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

// listar utilizadores
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        userType: true,
        studentNumber: true,
      },
      orderBy: {
        userId: 'asc',
      },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter utilizadores.' });
  }
});

// obter utilizador por id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { userId: id },
      include: {
        userType: true,
        studentNumber: true,
        userNIF: true,
        userContact: {
          include: {
            contact: {
              include: {
                contactType: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter utilizador.' });
  }
});

// criar utilizador
router.post('/', async (req, res) => {
  try {
    const {
      user_name,
      user_birth_date,
      user_start_date,
      user_type_id,
      user_is_active,
      student_number,
      user_nif,
    } = req.body;

    if (!user_name || !user_type_id || user_is_active === undefined) {
      return res.status(400).json({
        error: 'Campos obrigatórios: user_name, user_type_id, user_is_active',
      });
    }

    const lastUser = await prisma.user.findFirst({
      orderBy: { userId: 'desc' },
      select: { userId: true },
    });

    const nextId = (lastUser?.userId ?? 0) + 1;

    const createdUser = await prisma.user.create({
      data: {
        userId: nextId,
        userName: user_name,
        userBirthDate: user_birth_date ? new Date(user_birth_date) : null,
        userStartDate: user_start_date ? new Date(user_start_date) : null,
        userTypeId: Number(user_type_id),
        userIsActive: Boolean(user_is_active),
      },
      include: {
        userType: true,
      },
    });

    if (student_number) {
      await prisma.studentNumber.create({
        data: {
          userId: nextId,
          studentNumber: student_number,
        },
      });
    }

    if (user_nif) {
      await prisma.userNIF.create({
        data: {
          userId: nextId,
          userNif: user_nif,
        },
      });
    }

    const finalUser = await prisma.user.findUnique({
      where: { userId: nextId },
      include: {
        userType: true,
        studentNumber: true,
        userNIF: true,
      },
    });

    res.status(201).json(finalUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar utilizador.' });
  }
});

// atualizar utilizador
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      user_name,
      user_birth_date,
      user_start_date,
      user_type_id,
      user_is_active,
    } = req.body;

    const existing = await prisma.user.findUnique({
      where: { userId: id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    const updated = await prisma.user.update({
      where: { userId: id },
      data: {
        userName: user_name ?? existing.userName,
        userBirthDate:
          user_birth_date !== undefined
            ? user_birth_date
              ? new Date(user_birth_date)
              : null
            : existing.userBirthDate,
        userStartDate:
          user_start_date !== undefined
            ? user_start_date
              ? new Date(user_start_date)
              : null
            : existing.userStartDate,
        userTypeId:
          user_type_id !== undefined
            ? Number(user_type_id)
            : existing.userTypeId,
        userIsActive:
          user_is_active !== undefined
            ? Boolean(user_is_active)
            : existing.userIsActive,
      },
      include: {
        userType: true,
        studentNumber: true,
        userNIF: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar utilizador.' });
  }
});

export default router;