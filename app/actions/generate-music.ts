'use server';

import Replicate from 'replicate';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-server';

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
});

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

export async function generateMusic(prompt: string, userId: string) {
    try {
        // 1. Replicate API 호출
        const input = {
            lyrics: "",
            caption: prompt,
            duration: 60,
            timeout_seconds: 30,
        };

        const output = await replicate.run(
            "visoar/ace-step-1.5:fd851baef553cb1656f4a05e8f2f8641672f10bc808718f5718b4b4bb2b07794",
            { input }
        );

        // 2. 생성된 오디오 URL 가져오기
        const outputArray = output as Array<{ url: () => string }>;
        const audioUrl = outputArray[0].url();

        // 3. 오디오 파일 다운로드
        const response = await fetch(audioUrl);
        const audioBuffer = Buffer.from(await response.arrayBuffer());

        // 4. Supabase Storage에 업로드
        const fileName = `${userId}/${Date.now()}_${crypto.randomUUID()}.mp3`;
        const { error: uploadError } = await supabaseAdmin.storage
            .from('musics')
            .upload(fileName, audioBuffer, {
                contentType: 'audio/mpeg',
                upsert: false,
            });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        // 5. Public URL 생성
        const { data: urlData } = supabaseAdmin.storage
            .from('musics')
            .getPublicUrl(fileName);

        // 6. musics 테이블에 기록
        const title = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
        const { data: musicData, error: insertError } = await supabaseAdmin
            .from('musics')
            .insert({
                user_id: userId,
                title,
                prompt,
                file_path: fileName,
                file_url: urlData.publicUrl,
                duration: 60,
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
