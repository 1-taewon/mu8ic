'use server';


import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-server';

export interface MusicTrack {
    id: string;
    user_id: string;
    title: string;
    prompt: string;
    file_path: string;
    file_url: string;
    duration: number;
    status: string;
    created_at: string;
}

import Replicate from 'replicate';

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
});

export async function generateMusic(prompt: string, userId: string) {
    try {
        console.log('Generating music using Replicate for prompt:', prompt);
        
        // 1. 모델의 최신 버전 정보를 동적으로 가져옴 (422 에러 방지)
        const model = await replicate.models.get("meta", "musicgen");
        const version = model.latest_version?.id;

        if (!version) {
            throw new Error('모델 버전을 가져오는 데 실패했습니다.');
        }

        // 2. 최신 버전으로 실행
        // @ts-ignore
        const output = await replicate.run(
            `meta/musicgen:${version}`,
            {
                input: {
                    prompt: prompt,
                    duration: 10,
                }
            }
        );

        if (!output || typeof output !== 'string') {
            throw new Error('AI 서버로부터 올바른 응답(URL)을 받지 못했습니다.');
        }

        const audioUrl = output;
        console.log('Audio generated at:', audioUrl);

        // 반환된 URL에서 오디오 데이터를 가져옴
        const audioResponse = await fetch(audioUrl);
        const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
        
        console.log('Music generated and downloaded successfully.');

        // 1. Supabase Storage에 업로드
        const fileName = `${userId}/${Date.now()}_${crypto.randomUUID()}.wav`;
        const { error: uploadError } = await supabaseAdmin.storage
            .from('musics')
            .upload(fileName, audioBuffer, {
                contentType: 'audio/wav',
                upsert: false,
            });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        // 2. Public URL 생성
        const { data: urlData } = supabaseAdmin.storage
            .from('musics')
            .getPublicUrl(fileName);

        // 3. musics 테이블에 기록
        const title = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
        const { data: musicData, error: insertError } = await supabaseAdmin
            .from('musics')
            .insert({
                user_id: userId,
                title,
                prompt,
                file_path: fileName,
                file_url: urlData.publicUrl,
                duration: 10,
                status: 'completed',
            })
            .select()
            .single();

        if (insertError) throw new Error(`DB insert failed: ${insertError.message}`);

        return { success: true, data: musicData as MusicTrack };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Music generation error:', message);
        return { success: false, error: message };
    }
}

export async function saveGeneratedMusic(formData: FormData, userId: string) {
    try {
        const file = formData.get('file') as File;
        const prompt = formData.get('prompt') as string;

        if (!file || !prompt) throw new Error('Missing file or prompt');

        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);

        // 1. Supabase Storage에 업로드
        const fileName = `${userId}/${Date.now()}_${crypto.randomUUID()}.wav`;
        const { error: uploadError } = await supabaseAdmin.storage
            .from('musics')
            .upload(fileName, audioBuffer, {
                contentType: 'audio/wav',
                upsert: false,
            });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        // 2. Public URL 생성
        const { data: urlData } = supabaseAdmin.storage
            .from('musics')
            .getPublicUrl(fileName);

        // 3. musics 테이블에 기록
        const title = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
        const { data: musicData, error: insertError } = await supabaseAdmin
            .from('musics')
            .insert({
                user_id: userId,
                title,
                prompt,
                file_path: fileName,
                file_url: urlData.publicUrl,
                duration: 10,
                status: 'completed',
            })
            .select()
            .single();

        if (insertError) throw new Error(`DB insert failed: ${insertError.message}`);

        return { success: true, data: musicData as MusicTrack };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Music save error:', message);
        return { success: false, error: message };
    }
}

export async function getUserMusics(userId: string) {
    const { data, error } = await supabaseAdmin
        .from('musics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message, data: [] as MusicTrack[] };
    return { success: true, data: (data || []) as MusicTrack[] };
}

export async function deleteMusic(musicId: string, userId: string) {
    try {
        const { data: music } = await supabaseAdmin
            .from('musics')
            .select('file_path')
            .eq('id', musicId)
            .eq('user_id', userId)
            .single();

        if (music) {
            await supabaseAdmin.storage.from('musics').remove([music.file_path]);
            await supabaseAdmin.from('musics').delete().eq('id', musicId).eq('user_id', userId);
        }

        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
    }
}
