import Ticket from '../models/Ticket.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { categorizeTicket, generateAiResponse } from '../services/aiService.js';

// Helper to log activity
const logActivity = async (ticketId, action, performedBy) => {
  await ActivityLog.create({ ticketId, action, performedBy });
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private (User)
const createTicket = async (req, res) => {
  const { title, description, priority, category: userCategory } = req.body;

  try {
    // 1. Determine Category (User selected OR AI categorized)
    let category = userCategory;
    if (!category || category === 'Auto-Assign (AI)') {
      category = await categorizeTicket(title, description);
    }

    // 2. Auto-assignment based on specialization
    let assignedTo = null;
    let technicians = [];

    if (category === 'Other') {
      // Assign to the absolute least busy technician across ALL specializations
      technicians = await User.find({ role: 'technician' });
    } else {
      technicians = await User.find({ role: 'technician', specialization: category });
      // Fallback to 'General' if no specialist found
      if (technicians.length === 0) {
        technicians = await User.find({ role: 'technician', specialization: 'General' });
      }
      // Absolute fallback: if still no tech found, pick ANY technician
      if (technicians.length === 0) {
        technicians = await User.find({ role: 'technician' });
      }
    }

    // Pick least busy technician
    if (technicians.length > 0) {
      const techLoads = await Promise.all(technicians.map(async (tech) => {
        const count = await Ticket.countDocuments({ assignedTo: tech._id, status: { $ne: 'Closed' } });
        return { techId: tech._id, count };
      }));
      techLoads.sort((a, b) => a.count - b.count);
      assignedTo = techLoads[0].techId;
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || 'Medium',
      category,
      createdBy: req.user._id,
      assignedTo,
    });

    await logActivity(ticket._id, 'Ticket created', req.user._id);
    if (assignedTo) {
      await logActivity(ticket._id, 'Ticket auto-assigned to technician', req.user._id);
      
      // Create a notification for the assigned technician
      await Notification.create({
        user: assignedTo,
        ticket: ticket._id,
        message: `You have been assigned a new ticket: ${ticket.title}`
      });
    }

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error creating ticket', error: error.message });
  }
};

// @desc    Get all tickets (Admin gets all, User gets theirs, Tech gets assigned)
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
  let query = {};
  
  console.log(`Ticket fetch request from: ${req.user.name} (Role: ${req.user.role})`);

  if (req.user.role === 'user') {
    query.createdBy = req.user._id;
  } else if (req.user.role === 'technician') {
    query.assignedTo = req.user._id;
  } else if (req.user.role === 'admin') {
    // Admin query is explicitly empty to get EVERYTHING
    query = {};
    console.log("Admin override: Fetching ALL tickets from database...");
  }

  const tickets = await Ticket.find(query)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });

  console.log(`Found ${tickets.length} tickets for ${req.user.role}`);
  res.json(tickets);
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email');

  if (ticket) {
    // Check access
    if (req.user.role === 'user' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view this ticket' });
    }
    if (req.user.role === 'technician' && ticket.assignedTo && ticket.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view this ticket' });
    }

    res.json(ticket);
  } else {
    res.status(404).json({ message: 'Ticket not found' });
  }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private (Technician/Admin)
const updateTicketStatus = async (req, res) => {
  const { status, resolutionNotes } = req.body;

  const ticket = await Ticket.findById(req.params.id);

  if (ticket) {
    ticket.status = status || ticket.status;
    if (resolutionNotes) {
      ticket.resolutionNotes = resolutionNotes;
    }

    const updatedTicket = await ticket.save();

    await logActivity(ticket._id, `Status updated to ${status}`, req.user._id);

    res.json(updatedTicket);
  } else {
    res.status(404).json({ message: 'Ticket not found' });
  }
};

// @desc    Chat with AI assistant for a ticket
// @route   POST /api/tickets/:id/chat
// @access  Private
const chatWithAi = async (req, res) => {
  const { message } = req.body;
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  // Check access
  if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: 'Not authorized to access this ticket' });
  }

  // Save user message
  ticket.aiConversation.push({ role: 'user', content: message });
  await ticket.save();

  // Generate AI Response
  const aiReply = await generateAiResponse(
    { title: ticket.title, description: ticket.description, category: ticket.category },
    ticket.aiConversation.slice(0, -1), // all previous messages excluding the one just added? No, wait, generateAiResponse expects previousMessages, we should pass all messages BEFORE the current one.
    message
  );

  // Save AI message
  ticket.aiConversation.push({ role: 'assistant', content: aiReply });
  const updatedTicket = await ticket.save();

  res.json(updatedTicket);
};

export { createTicket, getTickets, getTicketById, updateTicketStatus, chatWithAi };
