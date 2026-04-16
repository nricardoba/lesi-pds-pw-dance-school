import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

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

export const loginService = async (body: unknown) => {
  const parsedBody = loginSchema.safeParse(body);

  if (!parsedBody.success) {
    throw new AppError('Dados inválidos.', 400);
  }

  const { email, password } = parsedBody.data;

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
    throw new AppError('Credenciais inválidas.', 401);
  }

  const validPassword = await bcrypt.compare(
    password,
    credential.userCredentialPasswordHash
  );

  if (!validPassword) {
    throw new AppError('Credenciais inválidas.', 401);
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

  return {
    accessToken,
    user: {
      user_id: credential.user.userId,
      user_name: credential.user.userName,
      user_type_id: credential.user.userTypeId,
      user_type_desc: credential.user.userType.userTypeDesc,
    },
  };
};

export const registerService = async (body: unknown) => {
  const parsedBody = registerSchema.safeParse(body);

  if (!parsedBody.success) {
    throw new AppError('Dados inválidos.', 400);
  }

  const { user_name, email, password, user_type_id, user_is_active } =
    parsedBody.data;

  const existingEmail = await prisma.contact.findFirst({
    where: {
      contactValue: email,
    },
  });

  if (existingEmail) {
    throw new AppError('Este email já está registado.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        userName: user_name,
        userTypeId: user_type_id,
        userIsActive: user_is_active,
      },
      include: {
        userType: true,
      },
    });

    const createdContact = await tx.contact.create({
      data: {
        contactValue: email,
        contactTypeId: 1,
      },
    });

    const createdUserContact = await tx.userContact.create({
      data: {
        userId: createdUser.userId,
        contactId: createdContact.contactId,
        isMainContact: true,
      },
    });

    await tx.userCredential.create({
      data: {
        userId: createdUser.userId,
        userContactId: createdUserContact.userContactId,
        userCredentialPasswordHash: passwordHash,
      },
    });

    return createdUser;
  });

  return {
    message: 'Utilizador registado com sucesso.',
    user: {
      user_id: result?.userId,
      user_name: result?.userName,
      user_type_id: result?.userTypeId,
      user_type_desc: result?.userType.userTypeDesc,
    },
  };
};