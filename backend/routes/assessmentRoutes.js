import express from 'express';
import { getAssessments, createAssessment, submitAssessment, reviewAssessment } from '../controllers/assessmentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAssessments)
  .post(protect, admin, createAssessment);

router.route('/:id/submit')
  .put(protect, submitAssessment);

router.route('/:id/review')
  .put(protect, admin, reviewAssessment);

export default router;
