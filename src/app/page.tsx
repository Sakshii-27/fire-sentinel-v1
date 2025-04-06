"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Flame, QrCode, ShieldAlert, MapPin, Users, Bell, LayoutDashboard, ScanEye } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "QR Code System",
      description: "Instant building check-ins with unique QR codes for staff and guests"
    },
    {
      icon: <Flame className="w-8 h-8" />,
      title: "Fire Drill Management",
      description: "Automated drill scheduling, tracking, and compliance reporting"
    },
    {
      icon: <ShieldAlert className="w-8 h-8" />,
      title: "Real-time Alerts",
      description: "Immediate notifications for emergencies and safety violations"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Occupancy Tracking",
      description: "Live visualization of building occupants during emergencies"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Staff Training",
      description: "AI-powered fire safety training with real-time feedback"
    },
    {
      icon: <ScanEye className="w-8 h-8" />,
      title: "Evacuation Planning",
      description: "Smart pathfinding that considers fire locations and blocked exits"
    }
  ];

  const testimonials = [
    {
      quote: "Fire Sentinel revolutionized our hotel's safety protocols. The QR check-in system alone has saved us countless hours.",
      author: "Michael R., Hotel Manager"
    },
    {
      quote: "During our last fire drill, we evacuated 30% faster thanks to the real-time occupancy tracking.",
      author: "Sarah L., Facility Director"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 p-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Image
            src="/Pics/Logo.png"
            alt="Fire Sentinel Logo"
            width={48}
            height={48}
            className="hover:rotate-12 transition-transform duration-300"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
            Fire Sentinel
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-red-600 text-white rounded-full text-sm hover:shadow-lg transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
              Next-Gen Fire Safety for Modern Buildings
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Comprehensive fire safety management with real-time tracking, AI training, and automated compliance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/signup" 
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-red-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Start Free Trial
              </Link>
              <button className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                </svg>
                Watch Demo
              </button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <Image
              src="/image/dashboard-pre.png"
              alt="Fire Sentinel Dashboard Preview"
              width={600}
              height={400}
              className="rounded-xl shadow-2xl border border-gray-200"
            />
            <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-lg shadow-md">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-bold">4.9/5</span>
                <span className="text-gray-600 text-sm">(150+ reviews)</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Comprehensive Fire Safety Solutions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to ensure building safety and compliance in one platform
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-blue-500 transition-all hover:shadow-lg"
              >
                <div className="bg-gradient-to-r from-blue-600 to-red-600 w-12 h-12 rounded-full flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Simple Implementation</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started with Fire Sentinel in just a few easy steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Setup Your Buildings",
                description: "Add your properties and generate unique QR codes for each location",
                image: "/image/setup-building.jpg"
              },
              {
                step: "2",
                title: "Train Your Staff",
                description: "Use our AI training modules to prepare your team for emergencies",
                image: "/image/staff-training.jpg"
              },
              {
                step: "3",
                title: "Monitor & Improve",
                description: "Track safety metrics and continuously improve your protocols",
                image: "/image/analytics.jpg"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative mb-6">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={400}
                    height={250}
                    className="rounded-lg"
                  />
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-600 to-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Trusted by Safety Professionals</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join hundreds of hotels and commercial buildings using Fire Sentinel
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-xl border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                <p className="font-medium text-gray-900">— {testimonial.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Fire Safety?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join the leading fire safety platform trusted by hotels and commercial buildings worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/signup" 
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-all"
              >
                Start Free Trial
              </Link>
              <Link 
                href="/demo" 
                className="px-8 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-all"
              >
                Request Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/Pics/Logo.png"
                alt="Fire Sentinel Logo"
                width={40}
                height={40}
              />
              <h2 className="text-xl font-bold text-white">Fire Sentinel</h2>
            </div>
            <p className="text-sm">
              The complete fire safety management platform for modern buildings.
            </p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-800 text-sm text-center">
          © {new Date().getFullYear()} Fire Sentinel. All rights reserved.
        </div>
      </footer>
    </div>
  );
}