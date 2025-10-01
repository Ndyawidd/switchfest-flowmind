'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Navbar() {
    const router = useRouter()

    const handleAuthRedirect = (path: string) => {
        router.push(path)
    }

    return (
        <nav className="w-full flex justify-center sticky top-6 z-50">
            <div className="flex items-center justify-between w-[90%] max-w-5xl bg-white/90 backdrop-blur-md shadow-lg rounded-2xl px-6 py-3">
                {/* Logo */}
                <div className="flex items-center gap-2" onClick={() => handleAuthRedirect('/')}>
                    <button>
                        <Image
                            src="/Logo_FlowMind.png"
                            alt="FlowMind Logo"
                            width={150}
                            height={36}
                        />
                    </button>

                </div>

                {/* Right Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleAuthRedirect('/auth/login')}
                        className="px-5 py-2 text-blue-600 font-medium border border-blue-600 rounded-full hover:bg-blue-50 transition"
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => handleAuthRedirect('/auth/register')}
                        className="px-5 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition shadow-md"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </nav>
    )
}
