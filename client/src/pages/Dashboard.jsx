import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import UserDashboard from './dashboards/UserDashboard';
import TechDashboard from './dashboards/TechDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const getHomeComponent = () => {
    switch (user.role) {
      case 'admin': return <AdminDashboard />;
      case 'technician': return <TechDashboard />;
      case 'user': return <UserDashboard />;
      default: return <UserDashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-[-20%] left-[20%] w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 z-0 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 z-0 pointer-events-none"></div>
        
        {/* Helpdesk abstract background image overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}
        ></div>
        
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-8 z-10">
          <Routes>
            <Route path="/" element={getHomeComponent()} />
            {/* Add more specific routes based on roles later */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
