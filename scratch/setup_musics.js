const { createClient } = require('@supabase/supabase-js')

// .env.local 파일을 읽어서 환경 변수에 설정 (Node.js 환경용)
try {
  const fs = require('fs')
  const path = require('path')
  const envPath = path.resolve(__dirname, '../.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, ...value] = line.split('=')
      if (key && value) process.env[key.trim()] = value.join('=').trim()
    })
  }
} catch (e) {
  console.warn('.env.local 파일을 읽는 중 오류가 발생했습니다.')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('환경 변수(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupMusics() {
  console.log('--- 1. Storage Bucket 생성: musics ---')
  const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('musics', {
    public: true,
    allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'image/png', 'image/jpeg', 'image/webp'],
    fileSizeLimit: 52428800 // 50MB
  })

  if (bucketError) {
    if (bucketError.message === 'A bucket with this name already exists') {
      console.log('Bucket "musics"가 이미 존재합니다.')
    } else {
      console.error('Bucket 생성 실패:', bucketError.message)
    }
  } else {
    console.log('Bucket "musics" 생성 완료!')
  }

  console.log('\n--- 2. Database Table 생성: musics ---')
  const sql = `
    -- musics 테이블 생성
    create table if not exists public.musics (
      id uuid default gen_random_uuid() primary key,
      user_id uuid references public.users(id) on delete cascade not null,
      title text not null,
      prompt text,
      audio_url text,
      image_url text,
      duration integer, -- 초 단위
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );

    -- RLS(Row Level Security) 설정
    alter table public.musics enable row level security;

    -- 정책 설정 (사용자는 본인의 데이터만 관리 가능)
    drop policy if exists "Users can view their own musics" on public.musics;
    create policy "Users can view their own musics" on public.musics
      for select using ( auth.uid() = user_id );

    drop policy if exists "Users can insert their own musics" on public.musics;
    create policy "Users can insert their own musics" on public.musics
      for insert with check ( auth.uid() = user_id );

    drop policy if exists "Users can update their own musics" on public.musics;
    create policy "Users can update their own musics" on public.musics
      for update using ( auth.uid() = user_id );

    drop policy if exists "Users can delete their own musics" on public.musics;
    create policy "Users can delete their own musics" on public.musics
      for delete using ( auth.uid() = user_id );

    -- Storage Bucket에 대한 정책 설정 (SQL Editor에서 실행 필요)
    -- 참고: storage.objects 테이블에 대한 정책입니다.
  `;

  console.log('다음 SQL을 Supabase SQL Editor에 실행해 주세요:')
  console.log('--------------------------------------------------')
  console.log(sql)
  console.log('--------------------------------------------------')
  
  console.log('\n--- 3. Storage Policies (SQL Editor 권장) ---')
  console.log(`
    -- Storage 정책: 로그인한 사용자가 자신의 폴더(user_id)에 업로드/조회 가능하게 하려면:
    create policy "Allow authenticated uploads" on storage.objects
      for insert with check ( bucket_id = 'musics' and auth.role() = 'authenticated' );

    create policy "Allow public read access" on storage.objects
      for select using ( bucket_id = 'musics' );
  `)
}

setupMusics()
