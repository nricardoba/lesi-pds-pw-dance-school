import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { prisma } from '../../src/config/db';

describe('Testes de Integração - Setup Credentials', () => {

  const testUserWithoutCredentials = {
    userName: 'Sem Credencial Teste',
    email: 'no_cred_test@dance.pt',
    userTypeId: 3, 
    userIsActive: true,
  };

  let userId: number;
  let contactId: number;
  let userContactId: number;

  beforeAll(async () => {
    // Apagar caso ja exista
    const userContact = await prisma.userContact.findFirst({
        where: { contact: { contactValue: testUserWithoutCredentials.email } }
    });
    if (userContact) {
      await prisma.user.delete({ where: { userId: userContact.userId } });
      await prisma.contact.delete({ where: { contactId: userContact.contactId } });
    }

    // Criar um user manualmente SÓ com dados base e SEM credenciais
    const user = await prisma.user.create({
      data: {
        userName: testUserWithoutCredentials.userName,
        userTypeId: testUserWithoutCredentials.userTypeId,
        userIsActive: testUserWithoutCredentials.userIsActive
      }
    });

    const contact = await prisma.contact.create({
      data: {
        contactValue: testUserWithoutCredentials.email,
        contactTypeId: 2
      }
    });

    const uc = await prisma.userContact.create({
      data: {
        userId: user.userId,
        contactId: contact.contactId,
        isMainContact: true
      }
    });

    userId = user.userId;
    contactId = contact.contactId;
    userContactId = uc.userContactId;
  });

  afterAll(async () => {
    try {
      await prisma.user.delete({ where: { userId } });
      await prisma.contact.delete({ where: { contactId } });
    } catch {}
    await prisma.$disconnect();
  });

  it('deve falhar se o email não existir', async () => {
    const res = await request(app)
      .post('/auth/setup-credentials')
      .send({ email: 'doesntexist@dance.pt', password: 'password123' });
    expect(res.status).toBe(404);
  });

  it('deve criar credencial com sucesso para um user sem credenciais', async () => {
    const res = await request(app)
      .post('/auth/setup-credentials')
      .send({ email: testUserWithoutCredentials.email, password: 'newPassword123!' });
    
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Credenciais criadas com sucesso.');

    // Verificar na db a credencial
    const cred = await prisma.userCredential.findUnique({
      where: { userContactId }
    });
    expect(cred).not.toBeNull();
  });

  it('deve falhar ao tentar definir novamente a credencial do mesmo utilizador no setup-credentials', async () => {
    const res = await request(app)
      .post('/auth/setup-credentials')
      .send({ email: testUserWithoutCredentials.email, password: 'anotherPassword123' });
    
    expect(res.status).toBe(409);
  });

  it('login deve funcionar com a nova password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testUserWithoutCredentials.email, password: 'newPassword123!' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

});