import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { prisma } from '../../src/config/db';

describe('Testes de Integração - Autenticação & Rotas Protegidas', () => {

  const testUser = {
    userName: 'Utilizador de Testes',
    email: 'test_student_integration@dance.pt',
    password: 'passwordSegura123',
    userTypeId: 3, 
    userIsActive: true,
    userNif: '999888777', // Campo Opcional
    phoneNumber: '912345678', // Campo Opcional
  };

  let accessToken = '';

  // Corrige os contadores auto-incrementáveis do PostgreSQL (ID mismatch) caso 
  // a base de dados tenha sido gerada previamente pelo seed.ts com IDs manuais
  beforeAll(async () => {
    try {
      await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"User"', 'user_id'), coalesce(max(user_id), 0) + 1, false) FROM "User"`);
      await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Contact"', 'contact_id'), coalesce(max(contact_id), 0) + 1, false) FROM "Contact"`);
      await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"User_Contact"', 'user_contact_id'), coalesce(max(user_contact_id), 0) + 1, false) FROM "User_Contact"`);
      // O nome da tabela e id pode ter underscores no postgres mas no Prisma model chama-se UserCredential
      // Vamos assumir que a limpeza garante o correto funcionamento
      
      const userContact = await prisma.userContact.findFirst({
        where: { contact: { contactValue: testUser.email } }
      });
      if (userContact) {
        await prisma.user.delete({ where: { userId: userContact.userId } });
        await prisma.contact.delete({ where: { contactId: userContact.contactId } });
      }
    } catch (e) {
      console.warn('Aviso: Falha a sincronizar sequências ou a limpar BD antes dos testes', e);
    }
  });

  // Limpeza: Garante que removemos o utilizador de testes após os testes correrem.
  afterAll(async () => {
    try {
      const userContact = await prisma.userContact.findFirst({
        where: { contact: { contactValue: testUser.email } }
      });
      
      if (userContact) {
        // Apaga o utilizador (deve apagar em cascata os registos associados, como senhas e ligações)
        await prisma.user.delete({
          where: { userId: userContact.userId }
        });
        
        // Apaga também o contacto (email)
        await prisma.contact.delete({
          where: { contactId: userContact.contactId }
        });
      }
    } catch (err) {
      console.error('Falha ao limpar base de dados no afterAll:', err);
    } finally {
      await prisma.$disconnect();
    }
  });

  describe('1. Registo de Utilizador (/auth/register)', () => {
    it('deve registar um novo utilizador com sucesso', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('user_id');
      expect(response.body.user).toHaveProperty('user_name', testUser.userName);
    });

    it('deve impedir o registo de um utilizador com o mesmo email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain('já está registado');
    });

    it('deve armazenar a password na base de dados de forma encriptada (bcrypt hash)', async () => {
      // Consultamos diretamente a base de dados via Prisma para avaliar a segurança e os campos opcionais
      const credential = await prisma.userCredential.findFirst({
        where: {
          userContact: {
            contact: {
              contactValue: testUser.email,
            },
          },
        },
        include: {
          user: {
            include: {
              userNIF: true,
              userContact: { include: { contact: true } }
            }
          }
        }
      });

      expect(credential).toBeDefined();
      expect(credential?.userCredentialPasswordHash).not.toBe(testUser.password); // Garante que não é guardado em plain-text
      expect(credential?.userCredentialPasswordHash).toMatch(/^\$2[abxy]\$\d+\$/); // Garante que tem a assinatura típica de um hash bcrypt
      
      // Verifica se gravou os campos opcionais (NIF e Contacto extra)
      expect(credential?.user?.userNIF?.userNif).toBe(testUser.userNif);
      const savedPhone = credential?.user?.userContact.find(uc => uc.contact.contactTypeId === 1);
      expect(savedPhone?.contact.contactValue).toBe(testUser.phoneNumber);
    });
  });

  describe('2. Login e Emissão JWT (/auth/login)', () => {
    it('deve efetuar login com sucesso e gerar token JWT', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
      
      accessToken = response.body.accessToken;
    });

    it('deve impedir o login com password errada', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'passwordIncorreta!'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('Credenciais inválidas.');
    });
  });

  describe('3. Middleware de Autenticação (Acesso a rotas protegidas)', () => {
    it('deve aceitar um token JWT válido e passar no middleware de autenticação', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`);

      // 200 = autenticado e autorizado
      // 403 = autenticado mas sem permissões suficientes
      // Em ambos os casos, prova-se que o JWT foi validado com sucesso
      expect([200, 403]).toContain(response.status); 
    });

    it('deve rejeitar o acesso a rota protegida se o token não for enviado', async () => {
      const response = await request(app)
        .get('/users'); 

      expect(response.status).toBe(401);
    });

    it('deve rejeitar o acesso a rota protegida se o token for inválido', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer um-token-completamente-invalido');

      expect(response.status).toBe(401);
    });
  });

});