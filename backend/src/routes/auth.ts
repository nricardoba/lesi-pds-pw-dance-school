import { Router } from 'express';
import * as AuthController from '../controllers/authController';
import { ensureAuth } from '../middlewares/ensureAuth';

const router = Router();

router.post('/login', AuthController.loginController);
router.post('/register', AuthController.registerController);
router.post('/setup-credentials', AuthController.setupCredentialsController);
router.get('/verify', ensureAuth, AuthController.verifyTokenController);

export default router;
