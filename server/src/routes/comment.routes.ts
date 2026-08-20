import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { idParamValidator } from '../validators/common.validator';

const router = Router();

router.use(protect);

router.delete('/:id', idParamValidator(), validate, commentController.deleteComment);

export default router;
