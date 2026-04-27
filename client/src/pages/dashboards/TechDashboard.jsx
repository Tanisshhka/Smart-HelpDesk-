import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Filter, Loader2 } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const TechDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/tickets', config);
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    fetchTickets();
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/tickets/${ticketId}/status`, { status: newStatus }, config);
      fetchTickets();
    } catch (error) {
      console.error('Error updating status', error);
      alert('Failed to update ticket status');
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return t.status === 'Pending';
    if (filter === 'High Priority') return t.priority === 'High' || t.priority === 'Critical';
    return true;
  });

  const highPriorityCount = tickets.filter(t => t.priority === 'High' || t.priority === 'Critical').length;
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
          <h2 className="text-2xl font-bold text-gray-900">Technician Dashboard</h2>
          <p className="text-gray-500 text-sm">Specialization: <span className="font-semibold text-primary-600">{user.specialization}</span></p>
        </div>
        <button 
          onClick={handleManualRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-primary-500 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">My Assigned Tickets</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{tickets.length}</h3>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-red-500 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">High Priority</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{highPriorityCount}</h3>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-green-500 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Resolved (Total)</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{resolvedCount}</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center bg-gray-50 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Action Required</h3>
          <div className="flex space-x-2">
            {['All', 'Pending', 'High Priority'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f 
                    ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-6">
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">All caught up!</p>
              <p className="text-gray-400 text-sm mt-1">No {filter !== 'All' ? filter.toLowerCase() : ''} tickets assigned to you right now.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTickets.map(ticket => (
              <div key={ticket._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-gray-900 font-semibold text-lg">{ticket.title}</h4>
                      {ticket.priority === 'High' || ticket.priority === 'Critical' ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold uppercase tracking-wider">{ticket.priority}</span>
                      ) : null}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{ticket.description}</p>
                    <div className="flex items-center space-x-3 mt-3 text-xs text-gray-500">
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>By: {ticket.createdBy?.name || 'Unknown User'}</span>
                      <span>•</span>
                      <span className="font-medium text-primary-600 px-2 py-0.5 bg-primary-50 rounded border border-primary-100">{ticket.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 min-w-max">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleUpdateStatus(ticket._id, e.target.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                        ticket.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        ticket.status === 'Ongoing' ? 'bg-primary-50 text-primary-700 border-primary-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TechDashboard;
