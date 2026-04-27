import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Briefcase, ArrowRight, ShieldCheck, Cpu, Headphones, Cloud } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // default role
  const [specialization, setSpecialization] = useState('General');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register(name, email, password, role, specialization);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Ambient background light */}
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row-reverse overflow-hidden z-10 relative border border-gray-100">
        
        {/* Right Side (visually): Illustration & Animations */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 p-12 bg-gradient-to-bl from-primary-50 to-primary-100 relative overflow-hidden">
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            src="/helpdesk.png" 
            alt="IT Helpdesk" 
            className="w-full h-auto max-w-sm z-10 drop-shadow-xl"
          />
          <h2 className="mt-8 text-2xl font-bold text-gray-800 text-center z-10">Join the Team</h2>
          <p className="text-gray-600 text-center mt-2 z-10">Sign up and start managing your tickets.</p>

          {/* Floating animated icons */}
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }} className="absolute top-16 right-16 p-4 bg-white rounded-2xl shadow-lg border border-gray-100 opacity-90 z-20">
            <Cpu className="w-8 h-8 text-blue-500" />
          </motion.div>
          <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1.5 }} className="absolute top-32 left-12 p-3 bg-white rounded-2xl shadow-lg border border-gray-100 opacity-90 z-20">
            <Cloud className="w-6 h-6 text-indigo-500" />
          </motion.div>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 2.5 }} className="absolute bottom-24 right-24 p-4 bg-white rounded-2xl shadow-lg border border-gray-100 opacity-90 z-20">
            <Headphones className="w-7 h-7 text-purple-500" />
          </motion.div>
        </div>

        {/* Left Side (visually): Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary-100/50 rounded-br-full pointer-events-none"></div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-100 shadow-sm md:hidden"
              >
                <ShieldCheck className="w-8 h-8 text-primary-600" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-500 mt-2">Join the Smart IT Helpdesk system</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1">Account Role</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white appearance-none transition-all shadow-sm"
                      value={role}
                      onChange={(e) => {
                        setRole(e.target.value);
                        if (e.target.value !== 'technician') setSpecialization('General');
                      }}
                    >
                      <option value="user">Standard User</option>
                      <option value="technician">IT Technician</option>
                      <option value="admin">System Admin</option>
                    </select>
                 </div>
              </div>

              <AnimatePresence>
                {role === 'technician' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                     <label className="block text-sm font-semibold text-gray-700 mb-1 mt-1">Specialization</label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <ShieldCheck className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white appearance-none transition-all shadow-sm"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                        >
                          <option value="General">General IT</option>
                          <option value="Hardware">Hardware</option>
                          <option value="Network">Network</option>
                          <option value="Software">Software</option>
                          <option value="Authentication">Authentication</option>
                          <option value="Security">Security</option>
                          <option value="Email">Email</option>
                          <option value="Access Management">Access Management</option>
                        </select>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all mt-6"
              >
                Create Account
                <ArrowRight className="ml-2 w-4 h-4" />
              </motion.button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary-600 hover:text-primary-800 transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
