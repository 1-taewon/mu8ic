'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
    Search, 
    LogOut, 
    Music, 
    User as UserIcon,
    ChevronDown,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function WorkspaceNavbar() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-8 bg-transparent">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/workspace')}>
                <span className="font-bold text-xl tracking-tight text-white">mu8ic</span>
            </div>

            {/* Center Search - Minimalist */}
            <div className="flex-1 max-w-md px-12">
                <div className="relative group">
                    <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-md rounded-full border border-white/5 group-hover:bg-white/[0.06] transition-all duration-300" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="relative z-10 w-full bg-transparent border-none py-2 pl-10 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none"
                    />
                </div>
            </div>

            {/* Profile */}
            <div 
                className="relative cursor-pointer"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
            >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                    {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                            <UserIcon size={14} className="text-white/40" />
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {isProfileOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-48 p-2 rounded-2xl bg-[#1a1a1a] border border-white/5 shadow-2xl z-50"
                        >
                            <button 
                                onClick={handleSignOut}
                                className="w-full flex items-center space-x-2 p-2 rounded-xl hover:bg-white/5 transition-colors text-white/70 hover:text-white"
                            >
                                <LogOut size={16} />
                                <span className="text-sm">Sign Out</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
