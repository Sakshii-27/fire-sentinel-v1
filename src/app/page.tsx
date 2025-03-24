"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
  useEffect(() => {
    // Simple animation trigger - could be enhanced with intersection observer
    const elements = document.querySelectorAll(".animate-on-scroll");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
        }
      });
    }, { threshold: 0.1 });

    elements.forEach((el) => observer.observe(el));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Modern Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 p-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/Pics/Logo.png"
              alt="Fire Sentinel Logo"
              width={48}
              height={48}
              className="hover:rotate-12 transition-transform"
            />
          </motion.div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
            Fire Sentinel
          </h1>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/signup"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Get Started
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section with Animation */}
      <header className="relative text-center py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-red-50/50 z-0"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6"
          >
            <span className="bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
              Revolutionizing
            </span> Emergency Response
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 text-xl text-gray-700 max-w-2xl mx-auto"
          >
            Our AI-powered platform ensures first responders have <span className="font-semibold text-blue-600">real-time visibility</span> of building occupants during emergencies.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              href="/demo"
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all font-medium text-lg"
            >
              See Live Demo
            </Link>
            <Link
              href="/about"
              className="px-8 py-3.5 bg-white text-gray-800 border-2 border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all font-medium text-lg hover:border-blue-400"
            >
              Learn More
            </Link>
          </motion.div>
        </div>

        {/* Animated decorative elements */}
        <div className="absolute top-20 -left-20 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 -right-20 w-72 h-72 rounded-full bg-red-400/10 blur-3xl animate-pulse delay-1000"></div>
      </header>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-all"
            >
              <div className="text-4xl font-bold text-blue-600">95%</div>
              <div className="text-gray-600 mt-2">Faster Response</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-all"
            >
              <div className="text-4xl font-bold text-blue-600">10K+</div>
              <div className="text-gray-600 mt-2">Lives Protected</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-all"
            >
              <div className="text-4xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-600 mt-2">Real-Time Monitoring</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-all"
            >
              <div className="text-4xl font-bold text-blue-600">99.9%</div>
              <div className="text-gray-600 mt-2">System Uptime</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section with Icons */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Fire Sentinel Protects You
          </h2>
          <p className="text-xl text-gray-600">
            A comprehensive safety solution that goes beyond traditional systems
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          {[
            {
              icon: "📍",
              title: "Real-Time Location Tracking",
              description: "Guests scan QR codes upon entry, enabling precise location tracking throughout your facility during emergencies.",
              color: "text-blue-600"
            },
            {
              icon: "🔥",
              title: "AI Fire Simulations",
              description: "Staff train with hyper-realistic AI simulations that adapt to your building's unique layout and risks.",
              color: "text-red-600"
            },
            {
              icon: "🛡️",
              title: "Crime Prevention",
              description: "Monitor movements to detect suspicious activity and prevent unauthorized access before incidents occur.",
              color: "text-green-600"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <div className={`text-5xl mb-6 ${feature.color}`}>{feature.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
              <Link href={`/features#${feature.title.toLowerCase().replace(/\s+/g, '-')}`} className="mt-6 inline-block text-blue-600 hover:text-blue-800 font-medium">
                Learn more →
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                See Fire Sentinel in Action
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Watch our 90-second demo to understand how our system transforms emergency response in real-world scenarios.
              </p>
              <ul className="space-y-4">
                {[
                  "Instant occupant location visualization",
                  "Automated emergency exit routing",
                  "Real-time communication with first responders",
                  "Post-incident analytics and reporting"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-6 h-6 text-green-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 relative rounded-xl overflow-hidden shadow-2xl">
              {/* Placeholder for video - replace with actual video component */}
              <div className="aspect-video bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center">
                <button className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                  </svg>
                </button>
              </div>
              <div className="absolute inset-0 border-4 border-white/20 rounded-xl pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Trusted by Safety Leaders
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Fire Sentinel reduced our emergency drill times by 70% while improving accuracy. A game-changer for campus safety.",
                name: "Sarah Johnson",
                title: "Director of Campus Safety, UCLA",
                avatar: "👩‍💼"
              },
              {
                quote: "The AI simulations prepare our staff for scenarios we never could have trained for previously. Response times have never been faster.",
                name: "Michael Chen",
                title: "Chief Security Officer, Hilton Hotels",
                avatar: "👨‍💼"
              },
              {
                quote: "After implementing Fire Sentinel, our insurance premiums dropped 25%. The ROI was immediate and the peace of mind is priceless.",
                name: "David Rodriguez",
                title: "Facility Manager, Salesforce Tower",
                avatar: "🧔‍♂️"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-lg italic text-gray-700 mb-6">"{testimonial.quote}"</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600">{testimonial.title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Building's Safety?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of forward-thinking organizations using Fire Sentinel to protect what matters most.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3.5 bg-white text-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all font-medium text-lg hover:bg-gray-100"
            >
              Request a Demo
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3.5 bg-transparent border-2 border-white/50 text-white rounded-full hover:bg-white/10 transition-all font-medium text-lg"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/Pics/Logo.png"
                alt="Fire Sentinel Logo"
                width={32}
                height={32}
              />
              <span className="text-white font-bold text-lg">Fire Sentinel</span>
            </div>
            <p className="text-sm">
              Revolutionizing emergency response through AI and real-time tracking technology.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/features" className="hover:text-white transition">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
              <li><Link href="/demo" className="hover:text-white transition">Demo</Link></li>
              <li><Link href="/updates" className="hover:text-white transition">What's New</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
              <li><Link href="/guides" className="hover:text-white transition">Guides</Link></li>
              <li><Link href="/webinars" className="hover:text-white transition">Webinars</Link></li>
              <li><Link href="/support" className="hover:text-white transition">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><Link href="/press" className="hover:text-white transition">Press</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Fire Sentinel. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-white transition">Terms</Link>
            <Link href="#" className="hover:text-white transition">Privacy</Link>
            <Link href="#" className="hover:text-white transition">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}