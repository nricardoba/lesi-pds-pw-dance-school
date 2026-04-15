import { Router } from 'express';
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/db';
import { env } from '../config/env';

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  user_name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(6),
  user_type_id: z.number().int().positive(),
  user_is_active: z.boolean(),
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const credential = await prisma.userCredential.findFirst({
      where: {
        userContact: {
          contact: {
            contactValue: email,
          },
        },
      },
      include: {
        user: {
          include: {
            userType: true,
          },
        },
      },
    });

    if (!credential) {
      return res.status(401).json({
        error: {
          message: 'Credenciais inválidas.',
        },
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      credential.userCredentialPasswordHash
    );

    if (!validPassword) {
      return res.status(401).json({
        error: {
          message: 'Credenciais inválidas.',
        },
      });
    }

    const accessToken = jwt.sign(
      {
        userTypeId: credential.user.userTypeId,
      },
      env.JWT_SECRET,
      {
        subject: String(credential.userId),
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      }
    );

    await prisma.userCredential.update({
      where: {
        userId: credential.userId,
      },
      data: {
        userCredentialLastLogin: new Date(),
      },
    });

    return res.json({
      accessToken,
      user: {
        user_id: credential.user.userId,
        user_name: credential.user.userName,
        user_type_id: credential.user.userTypeId,
        user_type_desc: credential.user.userType.userTypeDesc,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: {
        message: 'Erro interno do servidor.',
      },
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { user_name, email, password, user_type_id, user_is_active } =
      registerSchema.parse(req.body);

    const existingEmail = await prisma.contact.findFirst({
      where: {
        contactValue: email,
      },
    });

    if (existingEmail) {
      return res.status(409).json({
        error: {
          message: 'Este email já está registado.',
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const lastUser = await tx.user.findFirst({
        orderBy: { userId: 'desc' },
        select: { userId: true },
      });

      const nextUserId = (lastUser?.userId ?? 0) + 1;

      const lastContact = await tx.contact.findFirst({
        orderBy: { contactId: 'desc' },
        select: { contactId: true },
      });

      const nextContactId = (lastContact?.contactId ?? 0) + 1;

      const lastUserContact = await tx.userContact.findFirst({
        orderBy: { userContactId: 'desc' },
        select: { userContactId: true },
      });

      const nextUserContactId = (lastUserContact?.userContactId ?? 0) + 1;

      await tx.user.create({
        data: {
          userId: nextUserId,
          userName: user_name,
          userTypeId: user_type_id,
          userIsActive: user_is_active,
        },
      });

      await tx.contact.create({
        data: {
          contactId: nextContactId,
          contactValue: email,
          contactTypeId: 1, // 1 = Email
        },
      });

      await tx.userContact.create({
        data: {
          userContactId: nextUserContactId,
          userId: nextUserId,
          contactId: nextContactId,
          isMainContact: true,
        },
      });

      await tx.userCredential.create({
        data: {
          userId: nextUserId,
          userContactId: nextUserContactId,
          userCredentialPasswordHash: passwordHash,
        },
      });

      const createdUser = await tx.user.findUnique({
        where: { userId: nextUserId },
        include: {
          userType: true,
        },
      });

      return createdUser;
    });

    return res.status(201).json({
      message: 'Utilizador registado com sucesso.',
      user: {
        user_id: result?.userId,
        user_name: result?.userName,
        user_type_id: result?.userTypeId,
        user_type_desc: result?.userType.userTypeDesc,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: {
        message: 'Erro interno do servidor.',
      },
    });
  }
});

export default router;