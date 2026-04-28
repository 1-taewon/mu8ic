'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { WorkspaceNavbar } from '@/components/workspace/workspace-navbar';
import { PromptInputBox } from '@/components/workspace/prompt-input';
import { MusicList } from '@/components/workspace/music-list';
import { generateMusic, getUserMusics, deleteMusic } from '@/app/actions/generate-music';
import type { MusicTrack } from '@/app/actions/generate-music';

export default function WorkspacePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [tracks, setTracks] = useState<MusicTrack[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingPrompt, setGeneratingPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);

    // 음악 목록 불러오기
    const fetchTracks = useCallback(async () => {
        if (!user) return;
        const result = await getUserMusics(user.id);
        if (result.success && result.data) {
            setTracks(result.data);
        }
    }, [user]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) fetchTracks();
    }, [user, fetchTracks]);

    // 프롬프트 전송 → 음악 생성
    const handleSend = async (message: string) => {
        if (!user || isGenerating) return;

        setError(null);
        setIsGenerating(true);
        setGeneratingPrompt(message);

        try {
            const result = await generateMusic(message, user.id);

            if (result.success) {
                await fetchTracks();
            } else {
                setError(result.error || 'Generation failed. Please try again.');
                console.error('Generation failed:', result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setIsGenerating(false);
            setGeneratingPrompt('');
        }
    };

    // 트랙 삭제
    const handleDelete = async (trackId: string) => {
        if (!user) return;
        await deleteMusic(trackId, user.id);
        setTracks(prev => prev.filter(t => t.id !== trackId));
    };

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
            <main className="relative flex-1 flex flex-col items-center overflow-hidden">
                {/* 배경 글로우 효과 */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <motion.div
                        animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[20%] left-[15%] w-64 h-32 bg-white/5 blur-[100px] rounded-full rotate-45"
                    />
                    <motion.div
                        animate={{ x: [0, -40, 0], y: [0, 60, 0], scale: [1.2, 1, 1.2] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-[30%] right-[20%] w-96 h-48 bg-white/[0.03] blur-[120px] rounded-full -rotate-12"
                    />
                </div>

                {/* 중앙 콘텐츠: 환영 메시지 + 음악 리스트 */}
                <div className={cn(
                    "relative z-10 flex-1 flex flex-col items-center w-full px-6 pb-32 pt-8 overflow-y-auto scrollbar-none",
                    tracks.length === 0 && !isGenerating ? "justify-center" : "justify-start"
                )}>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {tracks.length === 0 && !isGenerating ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="flex flex-col items-center space-y-6"
                        >
                            <h1 className="text-white/40 text-sm font-medium tracking-[0.3em] uppercase text-center">
                                What music should we create today?
                            </h1>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: 40 }}
                                transition={{ delay: 0.5, duration: 1 }}
                                className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            />
                        </motion.div>
                    ) : (
                        <div className="w-full max-w-2xl py-4">
                            <MusicList
                                tracks={tracks}
                                isGenerating={isGenerating}
                                generatingPrompt={generatingPrompt}
                                onDelete={handleDelete}
                            />
                        </div>
                    )}
                </div>

                {/* 하단 프롬프트 입력창 (고정) */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-20">
                    <PromptInputBox
                        onSend={handleSend}
                        isLoading={isGenerating}
                        placeholder="Describe the music you want to create..."
                    />
                </div>
            </main>
        </div>
    );
}
