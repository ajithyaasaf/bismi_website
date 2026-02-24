'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { SHOP_CONFIG } from '@/lib/config';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim() || loading) return;

        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            router.push('/admin');
        } catch (err: unknown) {
            const firebaseError = err as { code?: string };
            if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/wrong-password') {
                setError('Invalid email or password');
            } else if (firebaseError.code === 'auth/user-not-found') {
                setError('No admin account found');
            } else if (firebaseError.code === 'auth/too-many-requests') {
                setError('Too many attempts. Please wait a moment.');
            } else {
                setError('Login failed. Please try again.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Image
                        src="/logo.jpg"
                        alt={SHOP_CONFIG.name}
                        width={64}
                        height={64}
                        className="rounded-xl mx-auto mb-3"
                        priority
                    />
                    <h1 className="text-xl font-bold text-gray-900">{SHOP_CONFIG.name}</h1>
                    <p className="text-sm text-gray-400">Admin Login</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@bismibroilers.com"
                                className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
                                autoComplete="current-password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full mt-6 py-3 font-bold text-white rounded-xl transition-all ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 active:scale-[0.98]'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
