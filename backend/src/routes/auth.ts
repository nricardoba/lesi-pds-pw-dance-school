import { Router } from 'express';
import * as AuthController from '../controllers/authController';

const router = Router();

router.post('/login', AuthController.loginController);
router.post('/register', AuthController.registerController);

export default router;
