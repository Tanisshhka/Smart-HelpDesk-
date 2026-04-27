import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Ticket, BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle, Search, Filter, Loader2, Shield } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const [ticketsRes, usersRes] = await Promise.all([
        axios.get('/api/tickets', config),
        axios.get('/api/auth/users', config)
      ]);

      setTickets(ticketsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Fast 10-second polling for admin
    return () => clearInterval(interval);
  }, []);

  // Stats calculation
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(t => t.status === 'Pending').length;
  const ongoingTickets = tickets.filter(t => t.status === 'Ongoing').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed' || t.status === 'resolved').length;
  const totalTechnicians = users.filter(u => u.role === 'technician').length;

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">System Overview</h2>
          <div className="flex items-center mt-1">
            <p className="text-gray-500 text-sm">Managing {users.length} users and {totalTickets} support requests</p>
            <span className="mx-2 text-gray-300">•</span>
            <p className="text-[10px] font-mono text-gray-400">Last Sync: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="flex space-x-2">
           <button 
             onClick={fetchData}
             className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm flex items-center"
           >
             <Clock className="w-4 h-4 mr-2" />
             Refresh Stats
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <Ticket className="w-16 h-16 text-primary-500" />
          </div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Requests</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalTickets}</h3>
          <div className="mt-4 flex items-center text-xs text-primary-600 font-bold bg-primary-50 w-fit px-2 py-1 rounded">
            Across all departments
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <Clock className="w-16 h-16 text-yellow-500" />
          </div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Pending</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{pendingTickets}</h3>
          <div className="mt-4 flex items-center text-xs text-yellow-600 font-bold bg-yellow-50 w-fit px-2 py-1 rounded">
            Needs Assignment
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">In Progress</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{ongoingTickets}</h3>
          <div className="mt-4 flex items-center text-xs text-blue-600 font-bold bg-blue-50 w-fit px-2 py-1 rounded">
            Being Handled
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Resolved</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{resolvedTickets}</h3>
          <div className="mt-4 flex items-center text-xs text-green-600 font-bold bg-green-50 w-fit px-2 py-1 rounded">
            Completed Successfully
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Ticket Table */}
        <div className="lg:col-span-2 space-y-4">
           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
               <h3 className="text-lg font-bold text-gray-900 flex items-center">
                 <Ticket className="w-5 h-5 mr-2 text-primary-600" />
                 All Tickets
               </h3>
               <div className="flex items-center space-x-2 w-full sm:w-auto">
                 <div className="relative flex-1 sm:flex-initial">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input 
                     type="text"
                     placeholder="Search title or user..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                   />
                 </div>
                 <select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                 >
                   <option value="All">All Status</option>
                   <option value="Pending">Pending</option>
                   <option value="Ongoing">Ongoing</option>
                   <option value="Resolved">Resolved</option>
                   <option value="Closed">Closed</option>
                 </select>
               </div>
             </div>

             <div className="overflow-x-auto">
               {loading ? (
                 <div className="flex justify-center items-center py-20">
                   <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                 </div>
               ) : (
                 <table className="w-full text-left">
                   <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                     <tr>
                       <th className="px-6 py-3">Issue</th>
                       <th className="px-6 py-3">Category</th>
                       <th className="px-6 py-3">Priority</th>
                       <th className="px-6 py-3">Status</th>
                       <th className="px-6 py-3">Assigned To</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {filteredTickets.map(tk => (
                       <tr key={tk._id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4">
                           <div className="font-semibold text-gray-900">{tk.title}</div>
                           <div className="text-xs text-gray-400">By {tk.createdBy?.name}</div>
                         </td>
                         <td className="px-6 py-4">
                           <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">
                             {tk.category}
                           </span>
                         </td>
                         <td className="px-6 py-4">
                           <span className={`text-xs font-bold ${
                             tk.priority === 'High' || tk.priority === 'Critical' ? 'text-red-600' : 
                             tk.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                           }`}>
                             {tk.priority}
                           </span>
                         </td>
                         <td className="px-6 py-4">
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                             tk.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                             tk.status === 'Ongoing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                             'bg-green-50 text-green-700 border-green-200'
                           }`}>
                             {tk.status}
                           </span>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-600">
                              {tk.assignedTo ? (
                                <><Shield className="w-3 h-3 mr-1 text-primary-500" /> {tk.assignedTo.name}</>
                              ) : (
                                <span className="italic text-gray-400">Unassigned</span>
                              )}
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
             </div>
           </div>
        </div>

        {/* Sidebar: Users List */}
        <div className="space-y-6">
           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-indigo-600" />
                  Staff Members
                </h3>
             </div>
             <div className="p-4 max-h-[500px] overflow-y-auto">
               <div className="space-y-3">
                 {users.map(u => (
                   <div key={u._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                     <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          u.role === 'admin' ? 'bg-red-500' : u.role === 'technician' ? 'bg-indigo-600' : 'bg-gray-400'
                        }`}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{u.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{u.role} • {u.specialization || u.department}</p>
                        </div>
                     </div>
                     {u.role === 'technician' && (
                       <span className="w-2 h-2 bg-green-500 rounded-full ring-4 ring-green-100"></span>
                     )}
                   </div>
                 ))}
               </div>
             </div>
           </div>

           <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/20">
              <h4 className="font-bold text-lg mb-1 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Quick Insight
              </h4>
              <p className="text-primary-100 text-sm">
                Most requests this week are categorized as <span className="font-bold text-white underline decoration-yellow-400">Software Issue</span>. Consider training more staff in this area.
              </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
