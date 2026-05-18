import express from 'express';
const router = express.Router();
import { createTicket, getTickets, getTicketById, updateTicketStatus, chatWithAi, submitFeedback } from '../controllers/ticketController.js';
import { protect, technician } from '../middleware/authMiddleware.js';

router.route('/')
  .post(protect, createTicket)
  .get(protect, getTickets);

router.route('/:id')
  .get(protect, getTicketById);

router.route('/:id/status')
  .put(protect, technician, updateTicketStatus);

router.route('/:id/chat')
  .post(protect, chatWithAi);

router.route('/:id/feedback')
  .put(protect, submitFeedback);

export default router;
