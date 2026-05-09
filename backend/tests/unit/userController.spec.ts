import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as controller from '../../src/controllers/usersController';
import * as usersServices from '../../src/services/users';

vi.mock('../../src/services/users', () => ({
  listUsersService: vi.fn(),
  getUserByIdService: vi.fn(),
  getMyProfileService: vi.fn(),
  createUserService: vi.fn(),
  updateUserService: vi.fn(),
  updateMyProfileService: vi.fn(),

  listUserTypesService: vi.fn(),

  listUserClassRolesService: vi.fn(),
  createUserClassRoleService: vi.fn(),
  updateUserClassRoleService: vi.fn(),
  deleteUserClassRoleService: vi.fn(),

  upsertUserNifService: vi.fn(),
  deleteUserNifService: vi.fn(),

  upsertStudentNumberService: vi.fn(),
  deleteStudentNumberService: vi.fn(),

  addUserContactService: vi.fn(),
  deleteUserContactService: vi.fn(),

  addUserAddressService: vi.fn(),
  deleteUserAddressService: vi.fn(),
}));

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.locals = {};
  return res;
};

const next = vi.fn();

describe('Users Controller - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Users', () => {
    it('deve listar utilizadores com sucesso', async () => {
      const req: any = {};
      const res = mockRes();

      (usersServices.listUsersService as any).mockResolvedValue([
        { userId: 1, userName: 'Ana' },
      ]);

      await controller.listUsersController(req, res, next);

      expect(usersServices.listUsersService).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith([{ userId: 1, userName: 'Ana' }]);
    });

    it('deve obter utilizador por ID com sucesso', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockRes();

      (usersServices.getUserByIdService as any).mockResolvedValue({
        userId: 1,
        userName: 'Ana',
      });

      await controller.getUserByIdController(req, res, next);

      expect(usersServices.getUserByIdService).toHaveBeenCalledWith(req.params);
      expect(res.json).toHaveBeenCalledWith({ userId: 1, userName: 'Ana' });
    });

    it('deve obter o meu perfil com sucesso', async () => {
      const req: any = {};
      const res = mockRes();
      res.locals.user = { id: '1' };

      (usersServices.getMyProfileService as any).mockResolvedValue({
        userId: 1,
        userName: 'Ana',
      });

      await controller.getMyProfileController(req, res, next);

      expect(usersServices.getMyProfileService).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ userId: 1, userName: 'Ana' });
    });

    it('deve criar utilizador com sucesso', async () => {
      const req: any = {
        body: {
          userName: 'Ana',
          userTypeId: 1,
        },
      };
      const res = mockRes();

      (usersServices.createUserService as any).mockResolvedValue({
        userId: 1,
        userName: 'Ana',
      });

      await controller.createUserController(req, res, next);

      expect(usersServices.createUserService).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ userId: 1, userName: 'Ana' });
    });

    it('deve atualizar utilizador com sucesso', async () => {
      const req: any = {
        params: { id: '1' },
        body: { userName: 'Ana Atualizada' },
      };
      const res = mockRes();

      (usersServices.updateUserService as any).mockResolvedValue({
        userId: 1,
        userName: 'Ana Atualizada',
      });

      await controller.updateUserController(req, res, next);

      expect(usersServices.updateUserService).toHaveBeenCalledWith(
        req.params,
        req.body
      );
      expect(res.json).toHaveBeenCalledWith({
        userId: 1,
        userName: 'Ana Atualizada',
      });
    });

    it('deve atualizar o meu perfil com sucesso', async () => {
      const req: any = {
        body: { userName: 'Perfil Atualizado' },
      };
      const res = mockRes();
      res.locals.user = { id: '5' };

      (usersServices.updateMyProfileService as any).mockResolvedValue({
        userId: 5,
        userName: 'Perfil Atualizado',
      });

      await controller.updateMyProfileController(req, res, next);

      expect(usersServices.updateMyProfileService).toHaveBeenCalledWith(
        5,
        req.body
      );
      expect(res.json).toHaveBeenCalledWith({
        userId: 5,
        userName: 'Perfil Atualizado',
      });
    });
  });

  describe('User Profile Details', () => {
    it('deve criar ou atualizar NIF com sucesso', async () => {
      const req: any = {
        params: { id: '1' },
        body: { userNif: '123456789' },
      };
      const res = mockRes();

      (usersServices.upsertUserNifService as any).mockResolvedValue({
        userId: 1,
        userNif: '123456789',
      });

      await controller.upsertUserNifController(req, res, next);

      expect(usersServices.upsertUserNifService).toHaveBeenCalledWith(
        req.params,
        req.body
      );
      expect(res.json).toHaveBeenCalledWith({
        userId: 1,
        userNif: '123456789',
      });
    });

    it('deve apagar NIF com sucesso', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockRes();

      (usersServices.deleteUserNifService as any).mockResolvedValue({
        message: 'NIF apagado com sucesso.',
      });

      await controller.deleteUserNifController(req, res, next);

      expect(usersServices.deleteUserNifService).toHaveBeenCalledWith(req.params);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'NIF apagado com sucesso.',
      });
    });

    it('deve criar ou atualizar número de aluno com sucesso', async () => {
      const req: any = {
        params: { id: '1' },
        body: { studentNumber: '2026001' },
      };
      const res = mockRes();

      (usersServices.upsertStudentNumberService as any).mockResolvedValue({
        userId: 1,
        studentNumber: '2026001',
      });

      await controller.upsertStudentNumberController(req, res, next);

      expect(usersServices.upsertStudentNumberService).toHaveBeenCalledWith(
        req.params,
        req.body
      );
      expect(res.json).toHaveBeenCalledWith({
        userId: 1,
        studentNumber: '2026001',
      });
    });

    it('deve apagar número de aluno com sucesso', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockRes();

      (usersServices.deleteStudentNumberService as any).mockResolvedValue({
        message: 'Número de aluno apagado com sucesso.',
      });

      await controller.deleteStudentNumberController(req, res, next);

      expect(usersServices.deleteStudentNumberService).toHaveBeenCalledWith(
        req.params
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Número de aluno apagado com sucesso.',
      });
    });

    it('deve adicionar contacto com sucesso', async () => {
      const req: any = {
        params: { id: '1' },
        body: {
          contactValue: 'teste@email.com',
          contactTypeId: 1,
        },
      };
      const res = mockRes();

      (usersServices.addUserContactService as any).mockResolvedValue({
        userContactId: 1,
      });

      await controller.addUserContactController(req, res, next);

      expect(usersServices.addUserContactService).toHaveBeenCalledWith(
        req.params,
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ userContactId: 1 });
    });

    it('deve apagar contacto com sucesso', async () => {
      const req: any = {
        params: { id: '1', contactId: '1' },
      };
      const res = mockRes();

      (usersServices.deleteUserContactService as any).mockResolvedValue({
        message: 'Contacto apagado com sucesso.',
      });

      await controller.deleteUserContactController(req, res, next);

      expect(usersServices.deleteUserContactService).toHaveBeenCalledWith(
        req.params
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Contacto apagado com sucesso.',
      });
    });

    it('deve adicionar morada com sucesso', async () => {
      const req: any = {
        params: { id: '1' },
        body: {
          streetName: 'Rua A',
          postalCode: '1000-001',
          localityName: 'Lisboa',
          isMainAddress: true,
        },
      };
      const res = mockRes();

      (usersServices.addUserAddressService as any).mockResolvedValue({
        userAddressId: 1,
      });

      await controller.addUserAddressController(req, res, next);

      expect(usersServices.addUserAddressService).toHaveBeenCalledWith(
        req.params,
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ userAddressId: 1 });
    });

    it('deve apagar morada com sucesso', async () => {
      const req: any = {
        params: { id: '1', userAddressId: '1' },
      };
      const res = mockRes();

      (usersServices.deleteUserAddressService as any).mockResolvedValue({
        message: 'Morada apagada com sucesso.',
      });

      await controller.deleteUserAddressController(req, res, next);

      expect(usersServices.deleteUserAddressService).toHaveBeenCalledWith(
        req.params
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Morada apagada com sucesso.',
      });
    });
  });

  describe('User Types', () => {
    it('deve listar tipos de utilizador com sucesso', async () => {
      const req: any = {};
      const res = mockRes();

      (usersServices.listUserTypesService as any).mockResolvedValue([
        { userTypeId: 1, userTypeDesc: 'Administrador' },
      ]);

      await controller.listUserTypesController(req, res, next);

      expect(usersServices.listUserTypesService).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith([
        { userTypeId: 1, userTypeDesc: 'Administrador' },
      ]);
    });
  });

  describe('User Class Roles', () => {
    it('deve listar papéis de utilizador na aula com sucesso', async () => {
      const req: any = {};
      const res = mockRes();

      (usersServices.listUserClassRolesService as any).mockResolvedValue([
        { userClassRoleId: 1, userClassRoleDesc: 'Aluno' },
      ]);

      await controller.listUserClassRolesController(req, res, next);

      expect(usersServices.listUserClassRolesService).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith([
        { userClassRoleId: 1, userClassRoleDesc: 'Aluno' },
      ]);
    });

    it('deve criar papel de utilizador na aula com sucesso', async () => {
      const req: any = {
        body: { userClassRoleDesc: 'Professor Responsável' },
      };
      const res = mockRes();

      (usersServices.createUserClassRoleService as any).mockResolvedValue({
        userClassRoleId: 1,
        userClassRoleDesc: 'Professor Responsável',
      });

      await controller.createUserClassRoleController(req, res, next);

      expect(usersServices.createUserClassRoleService).toHaveBeenCalledWith(
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        userClassRoleId: 1,
        userClassRoleDesc: 'Professor Responsável',
      });
    });

    it('deve atualizar papel de utilizador na aula com sucesso', async () => {
      const req: any = {
        params: { id: '1' },
        body: { userClassRoleDesc: 'Professor Assistente' },
      };
      const res = mockRes();

      (usersServices.updateUserClassRoleService as any).mockResolvedValue({
        userClassRoleId: 1,
        userClassRoleDesc: 'Professor Assistente',
      });

      await controller.updateUserClassRoleController(req, res, next);

      expect(usersServices.updateUserClassRoleService).toHaveBeenCalledWith(
        req.params,
        req.body
      );
      expect(res.json).toHaveBeenCalledWith({
        userClassRoleId: 1,
        userClassRoleDesc: 'Professor Assistente',
      });
    });

    it('deve apagar papel de utilizador na aula com sucesso', async () => {
      const req: any = { params: { id: '1' } };
      const res = mockRes();

      (usersServices.deleteUserClassRoleService as any).mockResolvedValue(null);

      await controller.deleteUserClassRoleController(req, res, next);

      expect(usersServices.deleteUserClassRoleService).toHaveBeenCalledWith(
        req.params
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});