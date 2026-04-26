'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { WorkspaceNavbar } from '@/components/workspace/workspace-navbar';
import { PromptInputBox } from '@/components/workspace/prompt-input';

export default function WorkspacePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const handleSend = (message: string, files?: File[]) => {
        console.log('Sending message:', message, files);
        // 향후 AI 연동 로직이 들어갈 자리입니다.
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex font-sans flex-col selection:bg-white/20">
            {/* 상단 네비바 */}
            <WorkspaceNavbar />
            
            {/* 메인 컨텐츠 영역 */}
            <main className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
                {/* 배경 글로우 효과 (Liquid Blobs) */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <motion.div 
                        animate={{
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-[20%] left-[15%] w-64 h-32 bg-white/5 blur-[100px] rounded-full rotate-45"
                    />
                    <motion.div 
                        animate={{
                            x: [0, -40, 0],
                            y: [0, 60, 0],
                            scale: [1.2, 1, 1.2],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute bottom-[30%] right-[20%] w-96 h-48 bg-white/[0.03] blur-[120px] rounded-full -rotate-12"
                    />
                </div>

                {/* 중앙 환영 메시지 */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10 flex flex-col items-center space-y-6 mb-20"
                >
                    <h1 className="text-white/40 text-sm font-medium tracking-[0.3em] uppercase">
                        Welcome to your workspace
                    </h1>
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: 40 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                </motion.div>

                {/* 하단 프롬프트 입력창 (고정) */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-20">
                    <PromptInputBox 
                        onSend={handleSend}
                        placeholder="What music should we create today?"
                    />
                </div>
            </main>
        </div>
    );
}
