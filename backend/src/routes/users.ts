// src/routes/users.ts
import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

// listar utilizadores
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        User_Type: true,
        Student_Number: true,
      },
      orderBy: {
        user_id: 'asc',
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
      where: { user_id: id },
      include: {
        User_Type: true,
        Student_Number: true,
        User_NIF: true,
        User_Contact: {
          include: {
            Contact: {
              include: {
                Contact_Type: true,
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
      orderBy: { user_id: 'desc' },
      select: { user_id: true },
    });

    const nextId = (lastUser?.user_id ?? 0) + 1;

    const createdUser = await prisma.user.create({
      data: {
        user_id: nextId,
        user_name,
        user_birth_date: user_birth_date ? new Date(user_birth_date) : null,
        user_start_date: user_start_date ? new Date(user_start_date) : null,
        user_type_id: Number(user_type_id),
        user_is_active: Boolean(user_is_active),
      },
      include: {
        User_Type: true,
      },
    });

    if (student_number) {
      await prisma.student_Number.create({
        data: {
          user_id: nextId,
          student_number,
        },
      });
    }

    if (user_nif) {
      await prisma.user_NIF.create({
        data: {
          user_id: nextId,
          user_nif,
        },
      });
    }

    const finalUser = await prisma.user.findUnique({
      where: { user_id: nextId },
      include: {
        User_Type: true,
        Student_Number: true,
        User_NIF: true,
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
      where: { user_id: id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    const updated = await prisma.user.update({
      where: { user_id: id },
      data: {
        user_name: user_name ?? existing.user_name,
        user_birth_date:
          user_birth_date !== undefined
            ? user_birth_date
              ? new Date(user_birth_date)
              : null
            : existing.user_birth_date,
        user_start_date:
          user_start_date !== undefined
            ? user_start_date
              ? new Date(user_start_date)
              : null
            : existing.user_start_date,
        user_type_id:
          user_type_id !== undefined
            ? Number(user_type_id)
            : existing.user_type_id,
        user_is_active:
          user_is_active !== undefined
            ? Boolean(user_is_active)
            : existing.user_is_active,
      },
      include: {
        User_Type: true,
        Student_Number: true,
        User_NIF: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar utilizador.' });
  }
});

export default router;