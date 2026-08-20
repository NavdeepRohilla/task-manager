import { Router } from 'express';
import { query } from 'express-validator';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { getMe, listUsers } from '../controllers/user.controller';

const router = Router();

router.use(protect);

router.get('/me', getMe);
router.get('/', [query('search').optional().isString().trim().isLength({ max: 100 })], validate, listUsers);

export default router;
