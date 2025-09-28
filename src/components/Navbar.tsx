'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, LogOut } from 'lucide-react'

export default function Navbar() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
    }

    const handleAuthRedirect = (path: string) => {
        router.push(path)
    }

    return (
        <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between py-3">
                    {/* Logo + Branding */}
                    <div className="flex items-center gap-3">
                        <div className="p-1 rounded-xl">
                            <Image
                                src="/FlowMind_Logo.png"
                                alt="FlowMind Logo"
                                width={50}
                                height={50}
                                className="rounded-lg"
                            />
                        </div>
                        <span className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold">
                            <span className="font-black">Flow</span>Mind
                        </span>

                        {user && (
                            <span className="hidden md:inline text-gray-600 text-sm ml-4">
                                Welcome back,{' '}
                                <span className="font-semibold text-gray-800">
                                    {user.email?.split('@')[0]}
                                </span>
                                !
                            </span>
                        )}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {!user ? (
                            <>
                                <button
                                    onClick={() => handleAuthRedirect('/auth/login')}
                                    className="px-6 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors rounded-xl hover:bg-blue-50"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => handleAuthRedirect('/auth/register')}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    Get Started
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Navigation Links */}
                                <div className="hidden md:flex items-center space-x-6">
                                    <Link
                                        href="/toDoList"
                                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                    >
                                        To Do
                                    </Link>
                                    <Link
                                        href="/notes"
                                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                    >
                                        Notes
                                    </Link>
                                    <Link
                                        href="/moodTracker"
                                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                    >
                                        Mood Tracker
                                    </Link>
                                    <Link
                                        href="/summarize"
                                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                    >
                                        Summarize
                                    </Link>
                                </div>

                                {/* Add Notes Shortcut */}
                                <Link
                                    href="/notes/add"
                                    className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Notes</span>
                                </Link>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl font-medium transition-all duration-300"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}