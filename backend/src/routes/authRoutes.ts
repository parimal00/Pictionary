import { Router } from 'express';
import { guestLogin } from '../controllers/authController.ts';
import { validate } from '../middlewares/validate.ts';
import { guestLoginSchema } from '../validators/authValidator.ts';

const router = Router();

router.post('/guest-login', validate(guestLoginSchema), guestLogin);


export default router;