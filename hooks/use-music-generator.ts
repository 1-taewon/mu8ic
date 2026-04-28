import { useState, useCallback, useRef } from 'react';

export type GeneratorStatus = 'idle' | 'loading-model' | 'generating' | 'error' | 'success';

export function useMusicGenerator() {
    const [status, setStatus] = useState<GeneratorStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const workerRef = useRef<Worker | null>(null);

    const generate = useCallback(async (prompt: string): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            if (!workerRef.current) {
                workerRef.current = new Worker('/music-worker.js');
            }

            const worker = workerRef.current;

            worker.onmessage = (e) => {
                const { status, progress, message, audio, sampling_rate, error } = e.data;

                if (status === 'loading') {
                    setStatus('loading-model');
                    if (progress !== undefined) setProgress(progress);
                } else if (status === 'generating') {
                    setStatus('generating');
                    setProgress(100);
                } else if (status === 'complete') {
                    setStatus('success');
                    // Float32Array를 WAV Blob으로 변환
                    const wavBlob = encodeWAV(audio, sampling_rate);
                    resolve(wavBlob);
                } else if (status === 'error') {
                    setStatus('error');
                    setError(error);
                    reject(new Error(error));
                }
            };

            worker.postMessage({ prompt });
        });
    }, []);

    return { generate, status, progress, error };
}

// Float32Array를 WAV 파일로 인코딩하는 헬퍼 함수
function encodeWAV(samples: Float32Array, sampleRate: number) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 32 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
}
