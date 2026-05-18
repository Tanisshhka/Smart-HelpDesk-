import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, Search, Check, Info } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistically update
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-20 border-b border-gray-200 bg-white/70 backdrop-blur-md flex items-center justify-between px-8 z-20 sticky top-0">
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-96 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search tickets..." 
          className="bg-transparent border-none outline-none text-gray-700 pl-3 w-full text-sm placeholder-gray-400 focus:ring-0"
        />
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative" ref={dropdownRef}>
          <button 
            className="relative text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start gap-3 ${!notif.isRead ? 'bg-primary-50/30' : ''}`}
                    >
                      <div className={`mt-1 rounded-full p-1.5 ${!notif.isRead ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Info className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${!notif.isRead ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button 
                          onClick={() => markAsRead(notif._id)}
                          className="text-gray-400 hover:text-primary-600 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
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
