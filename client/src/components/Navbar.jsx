import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, Search, Check, Info, X, BellRing } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);
  const dropdownRef = useRef(null);
  const prevUnreadCountRef = useRef(0);

  const fetchNotifications = async () => {
    try {
      if (!user?.token) return;
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const newNotifications = res.data;
      const newUnreadCount = newNotifications.filter(n => !n.isRead).length;

      // Show toast popup if unread count increased (new notification arrived)
      if (newUnreadCount > prevUnreadCountRef.current && prevUnreadCountRef.current !== 0) {
        const latestUnread = newNotifications.find(n => !n.isRead);
        if (latestUnread) {
          setToastNotification(latestUnread);
          // Auto-dismiss toast after 6 seconds
          setTimeout(() => setToastNotification(null), 6000);
        }
      }
      // Also show toast on first load if there are unread notifications
      if (prevUnreadCountRef.current === 0 && newUnreadCount > 0) {
        const latestUnread = newNotifications.find(n => !n.isRead);
        if (latestUnread) {
          setToastNotification(latestUnread);
          setTimeout(() => setToastNotification(null), 6000);
        }
      }

      prevUnreadCountRef.current = newUnreadCount;
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s for responsiveness
    return () => clearInterval(interval);
  }, [user]);

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
      if (!user?.token) return;
      await axios.put(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
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
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 flex items-center justify-center bg-red-500 rounded-full border-2 border-white text-white text-[10px] font-bold animate-pulse px-1">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50" style={{ animation: 'fadeSlideDown 0.2s ease-out' }}>
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-blue-50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-primary-600" />
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-full font-bold shadow-sm">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center text-gray-400 text-sm">
                      <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif._id} 
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start gap-3 cursor-pointer ${!notif.isRead ? 'bg-blue-50/50 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'}`}
                        onClick={() => !notif.isRead && markAsRead(notif._id)}
                      >
                        <div className={`mt-0.5 rounded-full p-2 shrink-0 ${!notif.isRead ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                          <BellRing className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!notif.isRead ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0 animate-pulse"></div>
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

      {/* Toast Popup Notification */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: -60, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -60, x: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-24 right-8 z-50 w-96"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-primary-100 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-blue-500 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <BellRing className="w-4 h-4 animate-bounce" />
                  <span className="text-sm font-bold">New Request Received!</span>
                </div>
                <button onClick={() => setToastNotification(null)} className="text-white/80 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-gray-800 font-medium">{toastNotification.message}</p>
                <p className="text-xs text-gray-400 mt-1">Just now</p>
              </div>
              {/* Progress bar auto-dismiss */}
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 6, ease: 'linear' }}
                className="h-1 bg-gradient-to-r from-primary-400 to-blue-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Navbar;
