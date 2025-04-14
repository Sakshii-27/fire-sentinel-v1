'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    fetchSignInMethodsForEmail,
    sendPasswordResetEmail
} from 'firebase/auth'
import { auth } from '../firebaseConfig'

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showResetEmailSent, setShowResetEmailSent] = useState(false)
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

            switch (error.code) {
                case 'auth/user-not-found':
                    // Check if user exists with Google auth
                    const methods = await fetchSignInMethodsForEmail(auth, formData.email)
                    if (methods.includes('google.com')) {
                        setError('This email is registered with Google. Please sign in with Google.')
                    } else {
                        setError('No account found with this email')
                    }
                    break
                case 'auth/wrong-password':
                    setError('Incorrect password. Please try again or reset your password.')
                    setFormData(prev => ({ ...prev, password: '' }))
                    break
                case 'auth/invalid-email':
                    setError('Please enter a valid email address')
                    break
                case 'auth/too-many-requests':
                    setError('Too many attempts. Please try again later or reset your password.')
                    break
                case 'auth/user-disabled':
                    setError('This account has been disabled. Please contact support.')
                    break
                default:
                    setError('Login failed. Please try again.')
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
            provider.setCustomParameters({ prompt: 'select_account' })
            await signInWithPopup(auth, provider)
            router.push('/dashboard')
        } catch (error: any) {
            console.error('Google sign-in failed:', error)

            switch (error.code) {
                case 'auth/account-exists-with-different-credential':
                    setError('This email is already registered with email/password. Please sign in with email/password first.')
                    break
                case 'auth/popup-closed-by-user':
                    setError('Sign-in popup was closed. Please try again.')
                    break
                default:
                    setError('Google sign-in failed. Please try again.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleForgotPassword = async () => {
        if (!formData.email) {
            setError('Please enter your email address first')
            return
        }

        try {
            await sendPasswordResetEmail(auth, formData.email)
            setShowResetEmailSent(true)
            setError('')
        } catch (error: any) {
            console.error('Password reset failed:', error)
            setError(error.message || 'Failed to send reset email. Please try again.')
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

                    <div className="px-6 pt-6">
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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
                                className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm"
                            >
                                {error}
                                {error.includes('Incorrect password') && (
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="mt-2 text-blue-400 underline text-sm block"
                                    >
                                        Reset password
                                    </button>
                                )}
                            </motion.div>
                        )}

                        {showResetEmailSent && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm"
                            >
                                Password reset email sent to {formData.email}. Please check your inbox.
                            </motion.div>
                        )}

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3.5 px-6 rounded-lg font-medium text-white transition-all ${isSubmitting ? 'bg-blue-700' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging in...
                                    </span>
                                ) : 'Login'}
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
                            <button
                                onClick={handleForgotPassword}
                                className="text-blue-400 hover:text-blue-300 font-medium transition"
                            >
                                Forgot password?
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}