import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { AppError } from "../utils/appError";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  userName: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(6),
  userTypeId: z.number().int().positive(),
  userIsActive: z.boolean(),
  userNif: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
});

const setupCredentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

export const loginService = async (body: unknown) => {
  const parsedBody = loginSchema.safeParse(body);

  if (!parsedBody.success) {
    throw new AppError("Dados inválidos.", 400);
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
    throw new AppError("Credenciais inválidas.", 401);
  }

  const validPassword = await bcrypt.compare(
    password,
    credential.userCredentialPasswordHash,
  );

  if (!validPassword) {
    throw new AppError("Credenciais inválidas.", 401);
  }

  const accessToken = jwt.sign(
    {
      userTypeId: credential.user.userTypeId,
    },
    env.JWT_SECRET,
    {
      subject: String(credential.userId),
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
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
    throw new AppError("Dados inválidos.", 400);
  }

  const { userName, email, password, userTypeId, userIsActive, userNif, phoneNumber } =
    parsedBody.data;

  const existingEmail = await prisma.contact.findFirst({
    where: {
      contactValue: email,
    },
  });

  if (existingEmail) {
    throw new AppError("Este email já está registado.", 409);
  }

  // Verifica se o NIF já existe caso for passado
  if (userNif) {
    const existingNif = await prisma.userNIF.findUnique({
      where: { userNif },
    });
    if (existingNif) throw new AppError("Este NIF já está registado.", 409);
  }

  let calculatedStudentNumber: string | null = null;
  if (userTypeId === 3) {
    const existingStudents = await prisma.studentNumber.findMany({ select: { studentNumber: true } });
    let maxNumber = 0;

    for (const st of existingStudents) {
      // Extrai apenas os números da string caso existam letras (ex: "A-123" -> 123)
      const numMatch = st.studentNumber.replace(/\D/g, "");
      if (numMatch) {
        const num = parseInt(numMatch, 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    }
    calculatedStudentNumber = String(maxNumber + 1).padStart(3, "0"); // se os numeros tiverem 3 algarismos no mínimo
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        userName,
        userTypeId,
        userIsActive,
      },
      include: {
        userType: true,
      },
    });

    const createdContact = await tx.contact.create({
      data: {
        contactValue: email,
        contactTypeId: 2, 
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

    if (userNif) {
      await tx.userNIF.create({
        data: {
          userId: createdUser.userId,
          userNif: userNif,
        },
      });
    }

    if (calculatedStudentNumber) {
      await tx.studentNumber.create({
        data: {
          userId: createdUser.userId,
          studentNumber: calculatedStudentNumber,
        },
      });
    }

    if (phoneNumber) {
      const createdPhoneContact = await tx.contact.create({
        data: {
          contactValue: phoneNumber,
          contactTypeId: 1, // 1 = Telemóvel (de acordo com o Seed)
        },
      });

      await tx.userContact.create({
        data: {
          userId: createdUser.userId,
          contactId: createdPhoneContact.contactId,
          isMainContact: false,
        },
      });
    }

    return createdUser;
  });

  return {
    message: "Utilizador registado com sucesso.",
    user: {
      user_id: result?.userId,
      user_name: result?.userName,
      user_type_id: result?.userTypeId,
      user_type_desc: result?.userType.userTypeDesc,
    },
  };
};

export const setupCredentialsService = async (body: unknown) => {
  const parsedBody = setupCredentialsSchema.safeParse(body);

  if (!parsedBody.success) {
    throw new AppError("Dados inválidos.", 400);
  }

  const { email, password } = parsedBody.data;

  const existingContact = await prisma.contact.findFirst({
    where: { contactValue: email },
    include: { userContact: true },
  });

  if (!existingContact) {
    throw new AppError("Este email não está registado no sistema. Contacte a escola.", 404);
  }

  const userContactRecord = existingContact.userContact[0];

  if (!userContactRecord) {
    throw new AppError("Este email não está associado a nenhum utilizador.", 404);
  }

  const existingCredential = await prisma.userCredential.findUnique({
    where: { userContactId: userContactRecord.userContactId },
  });

  if (existingCredential) {
    throw new AppError("Este utilizador já possui credenciais de acesso.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newCredential = await prisma.userCredential.create({
    data: {
      userId: userContactRecord.userId,
      userContactId: userContactRecord.userContactId,
      userCredentialPasswordHash: passwordHash,
    },
  });

  return { message: "Credenciais criadas com sucesso." };
};
