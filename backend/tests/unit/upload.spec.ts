import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
}));

vi.mock('multer', () => {
  const diskStorage = vi.fn((config) => config);
  const multerMock: any = vi.fn((config) => ({
    config,
    single: vi.fn(),
    array: vi.fn(),
  }));

  multerMock.diskStorage = diskStorage;

  return {
    default: multerMock,
  };
});

describe('Upload Middleware - Unit Tests', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('deve criar a pasta uploads se ela não existir', async () => {
    const fs = await import('fs');
    const multer = await import('multer');

    (fs.default.existsSync as any).mockReturnValue(false);

    await import('../../src/middlewares/upload');

    expect(fs.default.existsSync).toHaveBeenCalledWith('uploads/');
    expect(fs.default.mkdirSync).toHaveBeenCalledWith('uploads/', {
      recursive: true,
    });
    expect(multer.default.diskStorage).toHaveBeenCalled();
    expect(multer.default).toHaveBeenCalled();
  });

  it('não deve criar a pasta uploads se ela já existir', async () => {
    const fs = await import('fs');

    (fs.default.existsSync as any).mockReturnValue(true);

    await import('../../src/middlewares/upload');

    expect(fs.default.existsSync).toHaveBeenCalledWith('uploads/');
    expect(fs.default.mkdirSync).not.toHaveBeenCalled();
  });

  it('deve configurar limite de tamanho de 5MB', async () => {
    const fs = await import('fs');
    const multer = await import('multer');

    (fs.default.existsSync as any).mockReturnValue(true);

    await import('../../src/middlewares/upload');

    expect(multer.default).toHaveBeenCalledWith(
      expect.objectContaining({
        limits: {
          fileSize: 5 * 1024 * 1024,
        },
      })
    );
  });

  it('deve aceitar ficheiros de imagem no fileFilter', async () => {
    const fs = await import('fs');
    const multer = await import('multer');

    (fs.default.existsSync as any).mockReturnValue(true);

    await import('../../src/middlewares/upload');

    const multerConfig = (multer.default as any).mock.calls[0][0];
    const cb = vi.fn();

    multerConfig.fileFilter(
      {},
      {
        mimetype: 'image/png',
      },
      cb
    );

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('deve rejeitar ficheiros que não são imagem no fileFilter', async () => {
    const fs = await import('fs');
    const multer = await import('multer');

    (fs.default.existsSync as any).mockReturnValue(true);

    await import('../../src/middlewares/upload');

    const multerConfig = (multer.default as any).mock.calls[0][0];
    const cb = vi.fn();

    multerConfig.fileFilter(
      {},
      {
        mimetype: 'application/pdf',
      },
      cb
    );

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(cb.mock.calls[0][0].message).toBe(
      'Apenas ficheiros de imagem são permitidos!'
    );
  });

  it('deve configurar destination para uploads/', async () => {
    const fs = await import('fs');
    const multer = await import('multer');

    (fs.default.existsSync as any).mockReturnValue(true);

    await import('../../src/middlewares/upload');

    const storageConfig = (multer.default.diskStorage as any).mock.calls[0][0];
    const cb = vi.fn();

    storageConfig.destination({}, {}, cb);

    expect(cb).toHaveBeenCalledWith(null, 'uploads/');
  });

  it('deve gerar filename com extensão original', async () => {
    const fs = await import('fs');
    const multer = await import('multer');

    (fs.default.existsSync as any).mockReturnValue(true);

    vi.spyOn(Date, 'now').mockReturnValue(1710000000000);
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);

    await import('../../src/middlewares/upload');

    const storageConfig = (multer.default.diskStorage as any).mock.calls[0][0];
    const cb = vi.fn();

    storageConfig.filename(
      {},
      {
        originalname: 'foto.png',
      },
      cb
    );

    expect(cb).toHaveBeenCalledWith(
      null,
      expect.stringMatching(/^1710000000000-\d+\.png$/)
    );
  });
});