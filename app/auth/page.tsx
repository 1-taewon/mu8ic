'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#171717] flex items-center justify-center font-sans">
            {/* Liquid Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute -top-[10%] -left-[10%] h-[60%] w-[60%] rounded-full bg-yellow-400/20 blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [90, 0, 90],
                        x: [0, -100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute -bottom-[10%] -right-[10%] h-[60%] w-[60%] rounded-full bg-yellow-600/10 blur-[120px]"
                />
            </div>

            {/* Glassmorphism Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                    "relative z-10 w-full max-w-md p-8 md:p-12 mx-4",
                    "bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem]",
                    "border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]",
                    "before:absolute before:inset-0 before:rounded-[2.5rem] before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none"
                )}
            >
                <div className="flex flex-col items-center text-center space-y-8">
                    {/* Logo / Title */}
                    <div className="space-y-2">
                        <motion.h1
                            className="font-pirata text-6xl font-bold text-white tracking-wider"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            mu8ic
                        </motion.h1>
                        <p className="text-white/40 text-sm font-medium tracking-widest uppercase">
                            Your Sound, AI-Made
                        </p>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Login Section */}
                    <div className="w-full space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-white">Welcome</h2>
                            <p className="text-white/50 text-sm">
                                Sign in to start creating your unique sound
                            </p>
                        </div>

                        {/* Google Login Button */}
                        <motion.button
                            onClick={async () => {
                                await supabase.auth.signInWithOAuth({
                                    provider: 'google',
                                    options: {
                                        redirectTo: `${window.location.origin}/auth/callback`,
                                    },
                                });
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-2xl",
                                "bg-white text-black font-semibold transition-all hover:bg-neutral-200",
                                "shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            )}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </motion.button>
                    </div>
                </div>

                {/* Liquid Gloss Reflection Effect */}
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none opacity-50" />
            </motion.div>

            {/* Decorative text at the bottom */}
            {/* <div className="absolute bottom-8 text-white/20 text-xs tracking-widest uppercase">
                © 2024 MU8IC AI INC.
            </div> */}
        </div>
    );
}
