// app/signup/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth, db } from '../firebaseConfig'
import { doc, setDoc, getFirestore } from 'firebase/firestore'

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    hotelName: '',
    phone: ''
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )
      
      await updateProfile(userCredential.user, {
        displayName: formData.name
      })

      const db = getFirestore()
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        hotelName: formData.hotelName,
        phone: formData.phone,
        role: 'admin',
        createdAt: new Date()
      })

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Signup failed:', error)
      
      // Enhanced error handling
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please login instead.')
          setFormData(prev => ({...prev, email: ''})) // Clear email field
          break
        case 'auth/weak-password':
          setError('Password should be at least 6 characters')
          break
        case 'auth/invalid-email':
          setError('Please enter a valid email address')
          break
        default:
          setError('Signup failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setError('')
      setIsSubmitting(true)
      
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Check if this is a new user
      if (result.user.metadata.creationTime === result.user.metadata.lastSignInTime) {
        // New user - create profile in Firestore
        const db = getFirestore()
        await setDoc(doc(db, 'users', result.user.uid), {
          name: result.user.displayName || 'Google User',
          email: result.user.email,
          hotelName: 'To be completed',
          phone: result.user.phoneNumber || '',
          role: 'admin',
          createdAt: new Date()
        })
        
        // Redirect to profile completion page
        router.push('/complete-profile')
      } else {
        // Existing user - go to dashboard
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Google sign-in failed:', error)
      setError(error.message || 'Google sign-in failed. Please try again.')
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
            <h2 className="text-xl font-semibold text-white/90">Create Hotel Staff Account</h2>
          </div>

          {/* Google Sign-In Button */}
          <div className="px-6 pt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isSubmitting ? 'Signing in...' : 'Continue with Google'}
            </button>
          </div>

          <div className="px-6 py-4 flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="mx-4 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name Field */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <span className="absolute right-3 top-3 text-gray-400">👤</span>
              </div>
            </motion.div>

            {/* Email Field */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
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

            {/* Password Field */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
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
                  minLength={8}
                />
                <span className="absolute right-3 top-3 text-gray-400">🔒</span>
              </div>
            </motion.div>

            {/* Hotel Name Field */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <label className="block text-sm font-medium text-gray-300 mb-1">Hotel Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="hotelName"
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition"
                  placeholder="Grand Plaza Hotel"
                  value={formData.hotelName}
                  onChange={handleChange}
                  required
                />
                <span className="absolute right-3 top-3 text-gray-400">🏨</span>
              </div>
            </motion.div>

            {/* Phone Field */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <span className="absolute right-3 top-3 text-gray-400">📱</span>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center"
              >
               {error}
                {error.includes('already registered') && (
                  <div className="mt-2">
                    <Link href="/login" className="text-blue-400 underline text-sm">
                      Go to login page
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 px-6 rounded-lg font-medium text-white transition-all ${
                  isSubmitting ? 'bg-blue-700' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </motion.div>
          </form>

          <div className="px-6 py-4 bg-gray-800/30 text-center border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}