import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Garante que a pasta uploads existe
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração de onde e como guardar os ficheiros
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Guarda na pasta 'backend/uploads/'
  },
  filename: (req, file, cb) => {
    // Cria um nome único com a data atual para evitar substituir ficheiros com o mesmo nome
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para aceitar apenas ficheiros de imagem
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas ficheiros de imagem são permitidos!'));
  }
};

// Exporta o middleware pronto a usar nas rotas
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de tamanho de 5MB
  }
});