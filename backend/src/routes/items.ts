import { Router } from 'express';
import {
  listItemsController,
  getItemByIdController,
  createItemController,
  updateItemController,
  deleteItemController,
} from '../controllers/itemsController';

const router = Router();

router.get('/', listItemsController);
router.get('/:id', getItemByIdController);
router.post('/', createItemController);
router.put('/:id', updateItemController);
router.delete('/:id', deleteItemController);

export default router;
