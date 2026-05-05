import express from 'express';
import { getProjects, createProject, getProjectById, updateProject, deleteProject, addMember, removeMember } from '../controllers/projectController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, admin, createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, admin, updateProject)
  .delete(protect, admin, deleteProject);

router.route('/:id/add-member')
  .post(protect, admin, addMember);

router.route('/:id/remove-member')
  .delete(protect, admin, removeMember);

export default router;
