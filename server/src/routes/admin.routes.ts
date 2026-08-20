import { Router } from 'express';
import { Role } from '@prisma/client';
import * as adminController from '../controllers/admin.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { idParamValidator } from '../validators/common.validator';
import { updateUserRoleValidator, listUsersValidator } from '../validators/admin.validator';

const router = Router();

router.use(protect, restrictTo(Role.ADMIN));

router.get('/users', listUsersValidator, validate, adminController.listUsers);
router.patch(
  '/users/:id/role',
  idParamValidator(),
  updateUserRoleValidator,
  validate,
  adminController.updateUserRole
);
router.delete('/users/:id', idParamValidator(), validate, adminController.deleteUser);

router.get('/dashboard', adminController.getDashboard);

export default router;
