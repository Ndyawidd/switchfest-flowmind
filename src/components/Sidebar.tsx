'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import {
    LogOut,
    House,
    CircleCheckBig,
    Notebook,
    Brain,
    ScanFace,
    User as UserIcon,
    PanelRight
} from 'lucide-react';


export default function Sidebar({
    isCollapsed,
    setIsCollapsed,
}: {
    isCollapsed: boolean;
    setIsCollapsed: (v: boolean) => void;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [userEmail, setUserEmail] = useState('');
    //   const [isCollapsed, setIsCollapsed] = useState(false);


    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || '');
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error.message);
        } else {
            router.push('/auth/login');
        }
    };

    const navItems = [
        { name: 'Home', path: '/dashboard/homePage', icon: House },
        { name: 'To Do', path: '/dashboard/toDoList', icon: CircleCheckBig },
        { name: 'Notes', path: '/dashboard/notes', icon: Notebook },
        { name: 'Summarize', path: '/dashboard/summarize', icon: Brain },
        { name: 'Mood', path: '/dashboard/moodTracker', icon: ScanFace },
    ];

    return (
        <aside
            className={`list-none fixed top-0 left-0 h-screen bg-white shadow-xl z-40 transition-all duration-300 list-none ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            <div className="flex flex-col h-full p-4">
                {/* Logo and Collapse Button */}
                <div
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'
                        } p-4 mb-8`}
                >
                    {isCollapsed ? (
                        <Image
                            src="/Logo.png"
                            alt="FlowMind Logo"
                            width={36}
                            height={36}
                        />
                    ) : (
                        <Image
                            src="/Logo_FlowMind.png"
                            alt="FlowMind Logo"
                            width={150}
                            height={36}
                        />
                    )}

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`p-2 rounded-full text-blue-900 hover:bg-blue-200 transition-colors ${isCollapsed ? 'mx-auto' : ''
                            }`}
                    >
                        <PanelRight size={24} />
                    </button>
                </div>


                {/* User Info */}
                {/* {!isCollapsed && (
                    <div className="flex items-center gap-3 p-3 mb-6 bg-blue-100 rounded-xl">
                        <div className="p-2 bg-blue-200 rounded-full">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-blue-800 truncate">{userEmail}</span>
                    </div>
                )} */}

                {/* Navigasi */}
                <nav className="flex-1 space-y-2">
                    {navItems.map(item => (
                        <Link key={item.name} href={item.path}>
                            <div
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === item.path
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-blue-700 hover:bg-blue-100'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : ''}`} />
                                {!isCollapsed && <span>{item.name}</span>}
                            </div>
                        </Link>
                    ))}
                </nav>

                {/* Tombol Logout */}
                <div className="mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-3 rounded-lg text-blue-700 hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                        <LogOut className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : ''}`} />
                        {!isCollapsed && <span>Log Out</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}
