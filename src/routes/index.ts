import { Router } from 'express';
import { HomeController } from '../controllers/homeController';
import { AuthController } from '../controllers/authController';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, HomeController.index);
router.get('/submenu/:id', optionalAuth, HomeController.submenu);
router.get('/login', AuthController.loginPage);
router.post('/login', AuthController.login);
router.get('/register', AuthController.registerPage);
router.post('/register', AuthController.register);
router.post('/logout', AuthController.logout);
router.get('/account-settings', requireAuth, AuthController.accountSettingsPage);
router.get('/change-password', requireAuth, AuthController.changePasswordPage);
router.post('/change-password', requireAuth, AuthController.changePassword);
router.post('/delete-account', requireAuth, AuthController.deleteAccount);

export default router;

