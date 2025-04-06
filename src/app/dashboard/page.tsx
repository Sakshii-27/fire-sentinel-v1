"use client";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { collection, query, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from '../context/AuthContext';
import AIChatTrainer from '../../../components/AIChatTrainer';

interface ScanData {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: Timestamp;
  accuracy?: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [scans, setScans] = useState<ScanData[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const q = query(collection(db, "tracked_users"));
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          if (!isMounted) return;
          
          try {
            const scanData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }) as ScanData);
            setScans(scanData);
          } catch (error) {
            console.error("Error processing scan data:", error);
          } finally {
            if (initialLoad) setInitialLoad(false);
          }
        }, 
        (error) => {
          console.error("Firestore snapshot error:", error);
          setInitialLoad(false);
        }
      );

      return () => unsubscribe();
    }
  }, [user, loading, router, isMounted, initialLoad]);

  if (!isMounted || loading || initialLoad || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
          />
          <div className="text-white text-xl">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: "Guests Checked In", 
      value: scans.length, 
      change: `+${scans.length > 0 ? Math.floor(scans.length/2) : 0} today`, 
      icon: "👥" 
    },
    { 
      label: "Active Staff", 
      value: 8, 
      change: "All present", 
      icon: "🛡" 
    },
    { 
      label: "Emergency Drills", 
      value: 3, 
      change: "1 this week", 
      icon: "🔥" 
    },
    { 
      label: "System Uptime", 
      value: "99.9%", 
      change: "No issues", 
      icon: "✅" 
    }
  ];

  const quickActions = [
    { 
      title: "Scan QR Code", 
      description: "Register new guests and staff", 
      icon: "📱",
      href: "/qr",
      color: "from-blue-500 to-blue-600"
    },
    { 
      title: "Emergency Plans", 
      description: "View and manage evacuation routes", 
      icon: "🚨",
      href: "/plans",
      color: "from-red-500 to-red-600"
    },
    { 
      title: "Staff Management", 
      description: "Add or remove team members", 
      icon: "👨‍💼",
      href: "/staff",
      color: "from-green-500 to-green-600"
    },
    { 
      title: "Safety Reports", 
      description: "Generate compliance documents", 
      icon: "📊",
      href: "/reports",
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-40 p-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div whileHover={{ rotate: 15 }}>
              <Image
                src="/Picc/logo.png"
                alt="Fire Sentinel Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
              Fire Sentinel
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex space-x-4">
              <Link href="/notifications" className="p-2 rounded-full hover:bg-gray-700 transition">
                <span className="relative">
                  🔔
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </span>
              </Link>
              <Link href="/help" className="px-3 py-1 rounded-lg hover:bg-gray-700 transition">
                Help Center
              </Link>
            </nav>
            
            <motion.div whileHover={{ scale: 1.05 }} className="relative group">
              <button className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-700 px-3 py-2 rounded-lg transition">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm">{user.displayName?.charAt(0) || 'A'}</span>
                </div>
                <span>{user.displayName || 'Admin'}</span>
                <span>▼</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-1 hidden group-hover:block">
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-700">Profile</Link>
                <Link href="/settings" className="block px-4 py-2 hover:bg-gray-700">Settings</Link>
                <div className="border-t border-gray-700 my-1"></div>
                <button 
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 pb-20">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-600/30 to-blue-800/30 border border-blue-500/20 rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.displayName || 'Admin'}</h1>
              <p className="text-blue-200">Your hotel safety dashboard is ready. Last system check: Today {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
            <button className="mt-4 md:mt-0 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition backdrop-blur-sm">
              View Alerts
            </button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -5 }}
              className="bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 rounded-xl p-6 transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  <p className="text-xs text-green-400 mt-1">{stat.change}</p>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  href={action.href}
                  className={`block bg-gradient-to-br ${action.color} rounded-xl p-6 shadow-lg hover:shadow-xl transition h-full`}
                >
                  <div className="text-4xl mb-4">{action.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                  <p className="text-blue-100">{action.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Scans */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold flex items-center">
              <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
              Recent Guest Scans
            </h2>
          </div>
          <div className="divide-y divide-gray-700">
            {scans.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.slice(0, 5).map((scan) => (
                    <tr key={scan.id} className="hover:bg-gray-800/30 transition">
                      <td className="px-6 py-4 text-sm">{scan.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm">
                        {scan.location.latitude.toFixed(4)}, {scan.location.longitude.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {scan.timestamp.toDate().toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-400">No recent scans found</div>
            )}
          </div>
          {scans.length > 5 && (
            <div className="p-4 text-center border-t border-gray-700">
              <Link href="/qr" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                View All Scans →
              </Link>
            </div>
          )}
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900/80 border-t border-gray-800 p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <Image
              src="/Picc/logo.png"
              alt="Fire Sentinel Logo"
              width={32}
              height={32}
            />
            <span className="font-bold">Fire Sentinel</span>
          </div>
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} Fire Sentinel. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Chatbot Popup */}
      <div className="fixed bottom-6 right-6 z-50">
        <AIChatTrainer />
      </div>
    </div>
  );
}