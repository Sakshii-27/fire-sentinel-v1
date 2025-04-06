'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebaseConfig'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login failed:', error)
      
      // Enhanced error handling
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email')
          break
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again')
          setFormData(prev => ({...prev, password: ''})) // Clear password field
          break
        case 'auth/invalid-email':
          setError('Please enter a valid email address')
          break
        case 'auth/too-many-requests':
          setError('Too many attempts. Please try again later')
          break
        default:
          setError('Login failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-center">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center justify-center space-x-3 mb-4">
              <Image src="/Picc/logo.png" alt="Logo" width={48} height={48} className="rounded-lg" />
              <h1 className="text-2xl font-bold text-white">Fire Sentinel</h1>
            </motion.div>
            <h2 className="text-xl font-semibold text-white/90">Staff Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <span className="absolute right-3 top-3 text-gray-400">✉</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span className="absolute right-3 top-3 text-gray-400">🔒</span>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 px-6 rounded-lg font-medium text-white transition-all ${
                  isSubmitting ? 'bg-blue-700' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </motion.div>
          </form>

          <div className="px-6 py-4 bg-gray-800/30 text-center border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition">
                Create one
              </Link>
            </p>
            <p className="text-gray-400 text-sm mt-2">
              <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 font-medium transition">
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}