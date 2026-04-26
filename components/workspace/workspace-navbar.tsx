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
        <nav className="fixed top-0 left-0 right-0 h-20 z-50 flex items-center justify-between px-8 bg-transparent">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => router.push('/workspace')}>
                <motion.div 
                    whileHover={{ rotate: 15 }}
                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    <Music className="text-black w-6 h-6" />
                </motion.div>
                <span className="font-pirata text-3xl tracking-wider text-white group-hover:text-white/80 transition-colors">mu8ic</span>
            </div>

            {/* Center Search - Liquid Glass Style */}
            <div className="flex-1 max-w-xl px-12">
                <div className="relative group">
                    <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/10 group-hover:bg-white/[0.05] group-hover:border-white/20 transition-all duration-300 shadow-[0_4px_24px_0_rgba(0,0,0,0.3)]" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-hover:text-white/50 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search your library..." 
                        className="relative z-10 w-full bg-transparent border-none py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none"
                    />
                    {/* Liquid Reflection Effect */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Profile Popover */}
            <div 
                className="relative"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
            >
                <motion.div 
                    className={cn(
                        "flex items-center space-x-3 p-1.5 pr-4 rounded-full transition-all duration-300 cursor-pointer",
                        "bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:bg-white/[0.08]",
                        isProfileOpen && "bg-white/[0.08] border-white/20"
                    )}
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 p-[1px] overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#171717]">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <UserIcon size={16} className="text-white/40" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white leading-none mb-0.5">
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                        </span>
                        <span className="text-[10px] text-white/30 uppercase tracking-tighter font-medium">Free Member</span>
                    </div>
                    <ChevronDown className={cn("w-3 h-3 text-white/20 transition-transform duration-300", isProfileOpen && "rotate-180")} />
                </motion.div>

                {/* Popover Content */}
                <AnimatePresence>
                    {isProfileOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute right-0 mt-3 w-56 p-2 rounded-2xl bg-[#1a1a1a]/90 backdrop-blur-3xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                        >
                            <div className="px-3 py-2 mb-2 border-b border-white/5">
                                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Account</p>
                            </div>
                            
                            <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-white/70 hover:text-white group">
                                <Settings size={18} className="group-hover:rotate-45 transition-transform duration-500" />
                                <span className="text-sm font-medium">Settings</span>
                            </button>

                            <button 
                                onClick={handleSignOut}
                                className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-400 group"
                            >
                                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                                <span className="text-sm font-medium">Sign Out</span>
                            </button>

                            {/* Decorative Liquid Glow */}
                            <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-yellow-500/10 blur-2xl rounded-full" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
