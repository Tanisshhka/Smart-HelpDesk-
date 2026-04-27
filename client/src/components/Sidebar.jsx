import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Ticket, Users, Settings, LogOut, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['user', 'technician', 'admin'] },
    { name: 'My Tickets', path: '/dashboard/tickets', icon: <Ticket className="w-5 h-5" />, roles: ['user'] },
    { name: 'Assigned Tickets', path: '/dashboard/assigned', icon: <Ticket className="w-5 h-5" />, roles: ['technician'] },
    { name: 'All Tickets', path: '/dashboard/all-tickets', icon: <Ticket className="w-5 h-5" />, roles: ['admin'] },
    { name: 'Users', path: '/dashboard/users', icon: <Users className="w-5 h-5" />, roles: ['admin'] },
    { name: 'Analytics', path: '/dashboard/analytics', icon: <Activity className="w-5 h-5" />, roles: ['admin'] },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col z-20 relative shadow-sm">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400 flex items-center">
          <Settings className="w-6 h-6 mr-2 text-primary-600" />
          SmartDesk
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.filter(item => item.roles.includes(user.role)).map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.icon}
            <span className="ml-3 font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="ml-3 font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
