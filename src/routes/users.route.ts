import { Router } from 'express';
import usersController from '../controllers/users.controller';
import { handleValidationErrors, validateUpdateBalance } from '../utils/validators';

const router = Router();

router.post(
  '/balance',
  validateUpdateBalance,
  handleValidationErrors,
  usersController.updateBalance
);

export default router;
