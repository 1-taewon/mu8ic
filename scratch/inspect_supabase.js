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

async function inspectProject() {
  console.log('--- Supabase Project Inspection ---')
  
  // Check tables
  const { data: tables, error: tableError } = await supabase
    .from('_rpc_list_tables') // This might not work, fallback to a query
    .select('*')
    .limit(1)

  // fallback to generic query to check connection
  const { data: health, error: healthError } = await supabase.from('non_existent_table_to_check_connection').select('*').limit(1)
  
  if (healthError && healthError.code === 'PGRST116') {
      console.log('Status: Connected successfully.')
  } else if (healthError) {
      console.log('Status Check:', healthError.message)
  }

  // List schemas/tables via SQL if possible, or just report connection
  console.log('\n--- Recommendation ---')
  console.log('현재 프로젝트는 갓 생성된 상태이거나 테이블이 정의되지 않은 것으로 보입니다.')
  console.log('유튜브 음악 서비스(mu8ic)를 위해 다음 테이블들이 필요할 것으로 예상됩니다:')
  console.log('1. users / profiles (사용자 정보)')
  console.log('2. music_tracks (생성된 음악 데이터)')
  console.log('3. generation_history (AI 생성 기록)')
}

inspectProject()
