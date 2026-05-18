import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, CheckCircle, AlertCircle, X, Loader2, ShieldCheck, Send, ArrowRight, Star, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Auto-Assign (AI)');

  // AI Chat State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  const chatEndRef = useRef(null);

  // Feedback State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackTicket, setFeedbackTicket] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) scrollToBottom();
  }, [selectedTicket?.aiConversation, isChatOpen]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      const { data } = await axios.get('/api/tickets', config);
      setTickets(data);
      
      // Update selected ticket if chat is open to show new messages
      if (selectedTicket) {
        const updated = data.find(t => t._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (error) {
      console.error('Error fetching tickets', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const config = {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}` 
        }
      };
      const payload = { title, description, priority };
      if (category !== 'Auto-Assign (AI)') {
        payload.category = category;
      }
      await axios.post('/api/tickets', payload, config);
      
      // Reset form and close modal
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setCategory('Auto-Assign (AI)');
      setIsModalOpen(false);
      
      // Refresh list
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket', error);
      alert('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    try {
      setChatLoading(true);
      const config = {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}` 
        }
      };
      const { data } = await axios.post(`/api/tickets/${selectedTicket._id}/chat`, { message: chatMessage }, config);
      setSelectedTicket(data);
      setChatMessage('');
      fetchTickets();
    } catch (error) {
      console.error('Error sending message', error);
      alert('AI Assistant is temporarily unavailable.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (feedbackRating === 0) return alert('Please select a rating');
    try {
      setFeedbackSubmitting(true);
      const config = {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}` 
        }
      };
      await axios.put(`/api/tickets/${feedbackTicket._id}/feedback`, { rating: feedbackRating, feedback: feedbackText }, config);
      setIsFeedbackOpen(false);
      setFeedbackTicket(null);
      setFeedbackRating(0);
      setFeedbackText('');
      fetchTickets();
    } catch (error) {
      console.error('Error submitting feedback', error);
      alert('Failed to submit feedback');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Stats
  const pendingCount = tickets.filter(t => t.status === 'Pending').length;
  const ongoingCount = tickets.filter(t => t.status === 'Ongoing').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
          <p className="text-gray-500 text-sm">Welcome to your IT support portal</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl shadow-md shadow-primary-500/30 flex items-center transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-yellow-500 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Tickets</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{pendingCount}</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-primary-500 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Ongoing Tickets</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{ongoingCount}</h3>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-green-500 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Resolved</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{resolvedCount}</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Recent Tickets</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">
              No tickets found. Create one to get started!
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tickets.map(ticket => (
              <div 
                key={ticket._id} 
                onClick={() => { setSelectedTicket(ticket); setIsChatOpen(true); }}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-gray-900 font-semibold text-lg">{ticket.title}</h4>
                      {ticket.aiConversation && ticket.aiConversation.length > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">AI Support Active</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{ticket.description}</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                        ticket.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        ticket.status === 'Ongoing' ? 'bg-primary-50 text-primary-700 border-primary-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {ticket.status}
                      </span>
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {ticket.category}
                      </span>
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        Priority: {ticket.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    {(ticket.status === 'Resolved' || ticket.status === 'Closed') && !ticket.rating ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFeedbackTicket(ticket); setIsFeedbackOpen(true); }}
                        className="bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5" /> Give Feedback
                      </button>
                    ) : ticket.rating ? (
                      <div className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Rated {ticket.rating}/5
                      </div>
                    ) : null}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); setIsChatOpen(true); }}
                      className="text-primary-600 text-sm font-bold hover:text-primary-800 transition-colors flex items-center"
                    >
                      Support Chat <ArrowRight className="ml-1 w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900">Create New Ticket</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateTicket} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Issue Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Briefly describe the issue..."
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Detailed Description</label>
                  <textarea
                    required
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide as much detail as possible..."
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    >
                      <option value="Auto-Assign (AI)">Auto-Assign (AI)</option>
                      <option value="Hardware">Hardware Issue</option>
                      <option value="Software">Software Issue</option>
                      <option value="Network">Network Issue</option>
                      <option value="Authentication">Authentication</option>
                      <option value="Security">Security</option>
                      <option value="Email">Email</option>
                      <option value="Access Management">Access Management</option>
                      <option value="Other">Other / General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/30 transition-all font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                    ) : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Support Chat Modal */}
      <AnimatePresence>
        {isChatOpen && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 h-[80vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-primary-600 text-white">
                <div>
                  <h3 className="text-xl font-bold flex items-center">
                    <ShieldCheck className="w-6 h-6 mr-2" />
                    AI Support Assistant
                  </h3>
                  <p className="text-primary-100 text-xs">Troubleshooting: {selectedTicket.title}</p>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {/* Initial Ticket Context */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                  <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Issue Reported</p>
                  <p className="text-gray-900 font-medium">{selectedTicket.description}</p>
                </div>

                {/* Chat Messages */}
                {selectedTicket.aiConversation && selectedTicket.aiConversation.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}>
                      <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
                    </div>
                  </div>
                ))}
                
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm rounded-tl-none flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">Assistant is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type your response here..."
                    disabled={chatLoading}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatMessage.trim()}
                    className="bg-primary-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all disabled:opacity-50 shadow-md shadow-primary-500/20 flex items-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center">AI suggestions are automated. A technician is still assigned to your ticket.</p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isFeedbackOpen && feedbackTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFeedbackOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 px-6 py-5 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <MessageSquare className="w-6 h-6" />
                      Rate Your Experience
                    </h3>
                    <p className="text-white/80 text-sm mt-1">How was the resolution for your ticket?</p>
                  </div>
                  <button 
                    onClick={() => setIsFeedbackOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Ticket Info */}
              <div className="px-6 pt-5">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{feedbackTicket.title}</p>
                </div>
              </div>

              <form onSubmit={handleSubmitFeedback} className="px-6 pb-6 pt-4 space-y-5">
                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Your Rating</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        onMouseEnter={() => setFeedbackHover(star)}
                        onMouseLeave={() => setFeedbackHover(0)}
                        className="transition-all duration-200 transform hover:scale-125"
                      >
                        <Star 
                          className={`w-10 h-10 transition-all duration-200 ${
                            star <= (feedbackHover || feedbackRating) 
                              ? 'fill-amber-400 text-amber-400 drop-shadow-md' 
                              : 'text-gray-300 hover:text-gray-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {feedbackRating > 0 && (
                    <p className="text-center text-sm font-medium text-gray-500 mt-2">
                      {feedbackRating === 1 && '😞 Poor'}
                      {feedbackRating === 2 && '😐 Fair'}
                      {feedbackRating === 3 && '🙂 Good'}
                      {feedbackRating === 4 && '😊 Very Good'}
                      {feedbackRating === 5 && '🤩 Excellent!'}
                    </p>
                  )}
                </div>

                {/* Feedback Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Your Feedback (Optional)</label>
                  <textarea
                    rows="3"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={feedbackSubmitting || feedbackRating === 0}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all font-bold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {feedbackSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                    ) : (
                      <><Star className="w-4 h-4 mr-2" /> Submit Feedback</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserDashboard;
