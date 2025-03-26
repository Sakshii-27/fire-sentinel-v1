"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
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
        <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm">
          Get Started
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
            Building Safety Made Simple
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track building safety with our advanced QR code system
          </p>
          <Link
            href="/qr"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all font-semibold"
          >
            Scan or Generate QR Codes
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "QR Code Scanning",
                description: "Quickly check in to buildings by scanning their safety QR codes",
                icon: "📱"
              },
              {
                title: "QR Code Generation",
                description: "Generate unique QR codes for your buildings",
                icon: "🔄"
              },
              {
                title: "Real-time Tracking",
                description: "Track building occupancy in real-time",
                icon: "📍"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <Link
            href="/qr"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-full font-semibold"
          >
            Try Our QR System Now
          </Link>
        </div>
      </section>
    </div>
  );
}