import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className="h-20 border-b border-gray-200 bg-white/70 backdrop-blur-md flex items-center justify-between px-8 z-10">
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-96 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search tickets..." 
          className="bg-transparent border-none outline-none text-gray-700 pl-3 w-full text-sm placeholder-gray-400 focus:ring-0"
        />
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative text-gray-500 hover:text-gray-900 transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center space-x-3 border-l border-gray-200 pl-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center font-bold text-white shadow-md shadow-primary-500/30">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
            <p className="text-xs text-primary-600 font-medium capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
