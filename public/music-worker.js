// public/music-worker.js

// 전역 설정
self.process = { env: { NODE_ENV: 'production' } };

// 라이브러리 로드 (로컬 파일 사용으로 보안 및 네트워크 문제 해결)
importScripts('/transformers.min.js');

const { pipeline, env } = self.Transformers;

// 최적화 설정
env.allowLocalModels = false;
env.useBrowserCache = true;
env.remoteHost = 'https://huggingface.co';
env.remotePathTemplate = '{model}/resolve/{revision}/';

let generator = null;

self.onmessage = async (e) => {
    const { prompt } = e.data;

    try {
        if (!generator) {
            self.postMessage({ status: 'loading', message: 'Downloading AI Model (approx. 300MB)...' });
            
            generator = await pipeline('text-to-audio', 'Xenova/musicgen-small', {
                progress_callback: (p) => {
                    if (p.status === 'progress') {
                        // 다운로드 퍼센트 전송
                        self.postMessage({ 
                            status: 'loading', 
                            progress: Math.round(p.progress || 0),
                            message: `Downloading: ${Math.round(p.progress || 0)}%`
                        });
                    }
                }
            });
        }

        self.postMessage({ status: 'generating', message: 'Generating music on your device...' });
        
        // 실제 생성 시작
        const output = await generator(prompt, {
            max_new_tokens: 256,
            do_sample: true,
            temperature: 1.0,
        });

        self.postMessage({ 
            status: 'complete', 
            audio: output.audio, 
            sampling_rate: output.sampling_rate 
        });

    } catch (error) {
        console.error('Worker Error:', error);
        self.postMessage({ status: 'error', error: error.message });
    }
};
