'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Trash2, Download, Volume2, Music2, Loader2, RotateCcw } from 'lucide-react';
import type { MusicTrack } from '@/app/actions/generate-music';

interface MusicListProps {
    tracks: MusicTrack[];
    isGenerating: boolean;
    generatingPrompt?: string;
    onDelete: (trackId: string) => void;
}

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export const MusicList: React.FC<MusicListProps> = ({ tracks, isGenerating, generatingPrompt, onDelete }) => {
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [progress, setProgress] = useState<{ [id: string]: number }>({});
    const [durations, setDurations] = useState<{ [id: string]: number }>({});
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const animFrameRef = useRef<number | null>(null);

    const stopPlayback = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        setPlayingId(null);
    }, []);

    useEffect(() => {
        return () => stopPlayback();
    }, [stopPlayback]);

    const togglePlay = (track: MusicTrack) => {
        if (playingId === track.id) {
            stopPlayback();
            return;
        }

        stopPlayback();

        const audio = new Audio(track.file_url);
        audioRef.current = audio;
        setPlayingId(track.id);

        audio.addEventListener('loadedmetadata', () => {
            setDurations(prev => ({ ...prev, [track.id]: audio.duration }));
        });

        audio.addEventListener('ended', () => {
            setPlayingId(null);
            setProgress(prev => ({ ...prev, [track.id]: 0 }));
        });

        audio.play();

        const updateProgress = () => {
            if (audioRef.current && playingId === track.id) {
                setProgress(prev => ({
                    ...prev,
                    [track.id]: audioRef.current!.currentTime,
                }));
            }
            animFrameRef.current = requestAnimationFrame(updateProgress);
        };
        animFrameRef.current = requestAnimationFrame(updateProgress);
    };

    const handleDownload = async (track: MusicTrack) => {
        const response = await fetch(track.file_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${track.title}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    if (tracks.length === 0 && !isGenerating) return null;

    return (
        <div className="w-full flex flex-col items-center space-y-8 pb-20">
            {/* Generating State Card */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-2xl bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl"
                    >
                        <div className="flex flex-col space-y-6">
                            <div>
                                <h3 className="text-white text-lg font-medium">{generatingPrompt || 'Creating new music...'}</h3>
                                <p className="text-white/40 text-sm mt-1 italic">Generating with AI...</p>
                            </div>
                            
                            <div className="h-24 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden relative">
                                <div className="absolute inset-0 flex items-center justify-center gap-1">
                                    {[...Array(40)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="w-1 bg-white/10 rounded-full"
                                            animate={{
                                                height: [10, 40, 15, 30, 10],
                                            }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                delay: i * 0.05,
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="z-10 flex flex-col items-center">
                                    <Loader2 className="w-8 h-8 text-white/20 animate-spin mb-2" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Existing Tracks */}
            <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
                {tracks.map((track) => {
                    const isPlaying = playingId === track.id;
                    const currentTime = progress[track.id] || 0;
                    const totalDuration = durations[track.id] || track.duration;
                    const progressPct = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

                    return (
                        <motion.div
                            key={track.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-[32px] p-8 shadow-2xl relative group"
                        >
                            <button 
                                onClick={() => onDelete(track.id)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={16} className="text-white/20 hover:text-red-400" />
                            </button>

                            <div className="flex flex-col space-y-6">
                                {/* Header */}
                                <div>
                                    <h3 className="text-white text-lg font-medium">{track.title}</h3>
                                    <p className="text-white/40 text-sm mt-1">AI Generated</p>
                                </div>

                                {/* Waveform Visualizer Area */}
                                <div className="relative h-20 bg-white/[0.03] rounded-2xl flex items-center px-6 overflow-hidden">
                                    <div className="flex items-center gap-[3px] w-full h-full">
                                        {[...Array(60)].map((_, i) => {
                                            const isActive = isPlaying && (i / 60) * 100 <= progressPct;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`w-[3px] rounded-full transition-all duration-300 ${
                                                        isActive ? 'bg-purple-500' : 'bg-white/10'
                                                    }`}
                                                    style={{ 
                                                        height: `${Math.max(10, Math.sin(i * 0.2) * 40 + 40)}%`,
                                                        opacity: isActive ? 1 : 0.5
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Progress line */}
                                    <div 
                                        className="absolute top-0 bottom-0 w-px bg-white/20 transition-all duration-100"
                                        style={{ left: `calc(${progressPct}% + 24px)` }}
                                    />
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <button className="text-white/40 hover:text-white transition-colors">
                                            <RotateCcw size={18} />
                                        </button>
                                        
                                        <button
                                            onClick={() => togglePlay(track)}
                                            className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
                                        >
                                            {isPlaying ? (
                                                <Pause size={20} className="text-black fill-black" />
                                            ) : (
                                                <Play size={20} className="text-black fill-black ml-1" />
                                            )}
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <Volume2 size={18} className="text-white/40" />
                                            <div className="w-24 h-1 bg-white/10 rounded-full relative">
                                                <div className="absolute inset-y-0 left-0 w-3/4 bg-white/40 rounded-full" />
                                                <div className="absolute top-1/2 -translate-y-1/2 left-3/4 w-3 h-3 bg-white rounded-full shadow-lg" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-white/40 text-xs font-mono">
                                            {formatDuration(currentTime)} / {formatDuration(totalDuration)}
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleDownload(track)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/70 text-sm"
                                        >
                                            <Download size={16} />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                
                {tracks.length > 0 && (
                    <p className="text-white/20 text-sm font-medium pt-4">Create new music</p>
                )}
            </div>
        </div>
    );
};
