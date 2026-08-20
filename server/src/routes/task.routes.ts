import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import * as commentController from '../controllers/comment.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { idParamValidator } from '../validators/common.validator';
import { createTaskValidator, updateTaskValidator, listTasksValidator } from '../validators/task.validator';
import { addCommentValidator } from '../validators/comment.validator';

const router = Router();

router.use(protect); // every task route requires authentication

// IMPORTANT: /stats must be registered before /:id, or Express would match
// "stats" as the :id param instead of this route.
router.get('/stats', taskController.getMyStats);

router.post('/', createTaskValidator, validate, taskController.createTask);
router.get('/', listTasksValidator, validate, taskController.listTasks);
router.get('/:id', idParamValidator(), validate, taskController.getTask);
router.put('/:id', idParamValidator(), updateTaskValidator, validate, taskController.updateTask);
router.delete('/:id', idParamValidator(), validate, taskController.deleteTask);

router.post('/:id/comments', idParamValidator(), addCommentValidator, validate, commentController.addComment);
router.get('/:id/comments', idParamValidator(), validate, commentController.listComments);

export default router;
