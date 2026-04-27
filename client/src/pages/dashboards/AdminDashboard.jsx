import React from 'react';
import { motion } from 'framer-motion';
import { Users, Ticket, BarChart3, TrendingUp } from 'lucide-react';
// import { Bar } from 'react-chartjs-2'; // Will add chart later

const AdminDashboard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">System Admin</h2>
          <p className="text-gray-400 text-sm">System overview and analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Users</p>
              <h3 className="text-3xl font-bold text-white mt-1">124</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Active Tickets</p>
              <h3 className="text-3xl font-bold text-white mt-1">32</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <Ticket className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Avg Resolution Time</p>
              <h3 className="text-3xl font-bold text-white mt-1">4.2h</h3>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Technicians</p>
              <h3 className="text-3xl font-bold text-white mt-1">8</h3>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass rounded-2xl p-6">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Recent Activity</h3>
           </div>
           <div className="space-y-4">
             <div className="text-center py-8 text-gray-500">
               Activity feed will be populated here.
             </div>
           </div>
        </div>
        <div className="glass rounded-2xl p-6 flex flex-col justify-center items-center h-64">
           <BarChart3 className="w-16 h-16 text-gray-600 mb-4" />
           <p className="text-gray-400">Analytics charts will appear here</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
