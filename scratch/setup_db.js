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

async function setupDatabase() {
  console.log('--- Database Setup: Users Table & Trigger ---')
  
  const sql = `
    -- 1. users 테이블 생성
    create table if not exists public.users (
      id uuid references auth.users on delete cascade not null primary key,
      email text,
      full_name text,
      avatar_url text,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );

    -- 2. RLS(Row Level Security) 설정
    alter table public.users enable row level security;
    create policy "Allow individual read access" on public.users for select using ( auth.uid() = id );
    create policy "Allow individual update access" on public.users for update using ( auth.uid() = id );

    -- 3. 가입 시 자동 연동 트리거 함수
    create or replace function public.handle_new_user()
    returns trigger as $$
    begin
      insert into public.users (id, email, full_name, avatar_url)
      values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
      return new;
    end;
    $$ language plpgsql security definer;

    -- 4. 트리거 설정
    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  `;

  const { error } = await supabase.rpc('db_run_query', { query: sql }).catch(() => {
      // If RPC is not available, we use a different approach or inform the user to run it in dashboard
      return { error: 'RPC_NOT_FOUND' }
  })

  if (error) {
      console.log('\n[주의] Supabase 대시보드에서 직접 SQL을 실행해야 할 수도 있습니다.')
      console.log('이유: 보안상 브라우저/SDK에서는 직접 SQL 실행(RPC)이 제한될 수 있습니다.')
      console.log('\n다음 SQL을 복사하여 Supabase SQL Editor에 붙여넣어 주세요:')
      console.log(sql)
  } else {
      console.log('데이터베이스 설정 완료!')
  }
}

setupDatabase()
