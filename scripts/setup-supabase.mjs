import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// .env.local 파일에서 환경 변수 읽기
const envContent = readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const eqIndex = line.indexOf('=');
    if (eqIndex > 0) {
        const key = line.substring(0, eqIndex).trim();
        const value = line.substring(eqIndex + 1).trim();
        env[key] = value;
    }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function setup() {
    console.log('🔧 Setting up Supabase storage bucket...\n');

    // 1. musics 스토리지 버킷 생성
    const { data, error } = await supabase.storage.createBucket('musics', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav'],
    });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log('✅ Storage bucket "musics" already exists');
        } else {
            console.error('❌ Error creating bucket:', error.message);
        }
    } else {
        console.log('✅ Storage bucket "musics" created successfully');
    }

    // 2. SQL을 출력 (Supabase Dashboard에서 실행 필요)
    console.log('\n' + '='.repeat(60));
    console.log('📋 아래 SQL을 Supabase Dashboard SQL Editor에서 실행해주세요:');
    console.log('   https://supabase.com/dashboard/project/xgkcezsjkhmlmcqqdldf/sql/new');
    console.log('='.repeat(60) + '\n');
    console.log(`
CREATE TABLE IF NOT EXISTS public.musics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    duration INTEGER DEFAULT 60,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.musics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own musics"
    ON public.musics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own musics"
    ON public.musics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own musics"
    ON public.musics FOR DELETE
    USING (auth.uid() = user_id);
    `);
}

setup().catch(console.error);
