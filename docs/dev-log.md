# mu8ic — 개발 Q&A 로그

> 이 파일은 개발 과정에서 나온 질문과 해결 내용을 버전별로 정리한 문서입니다.

---

## 2026-04-24

### Q1. 깃 연동
```
git remote add origin https://github.com/1-taewon/mu8ic.git
git branch -M main
git push -u origin main
```
**상태:** 명령어 실행 권한 문제로 터미널에서 직접 실행 필요.

---

### Q2. MinimalistHero 컴포넌트 생성 및 랜딩페이지 적용 (1차 시도)

- `components/hero/MinimalistHero.tsx` 생성
- `lib/utils.ts` (`cn()`) 생성
- `app/page.tsx` 랜딩페이지로 교체
- **필요 패키지:** `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`

**결과:** 빌드 에러 발생 → Q3으로 이어짐

---

### Q3. 빌드 에러 — `Export Instagram doesn't exist in target module`

**원인:** `lucide-react` 최신 버전에서 SNS 브랜드 아이콘(`Instagram`, `Twitter`, `Youtube`, `Facebook`, `Linkedin`) 제거됨.

**해결:** 제거된 아이콘을 항상 존재하는 아이콘으로 교체
| 제거된 아이콘 | 대체 아이콘 |
|---|---|
| `Instagram` | `Music` |
| `Twitter` | `Headphones` |
| `Youtube` | `Radio` |
| `Facebook` | `Globe` |

---

### Q4. 커밋 버전으로 되돌리기

**요청:** 에러가 계속 발생하여 깃에 커밋된 버전으로 롤백.

**결과:** initial commit 버전(`export default function Home() { return <main>mu8ic</main> }`)으로 `app/page.tsx` 복원.

---

### Q5. 생성된 폴더 삭제

**요청:** `components/`, `lib/` 폴더 삭제.

**실행:**
```bash
cmd /c "rmdir /s /q c:\vibe\mu8ic\components && rmdir /s /q c:\vibe\mu8ic\lib"
```

---

### Q6. MinimalistHero 컴포넌트 생성 및 랜딩페이지 적용 (2차 시도)

**이전 실패 원인 반영:**
- `LucideIcon` 타입 대신 `LucideProps` 기반 타입 직접 정의 → 버전 호환성 해결
- SNS 브랜드 아이콘 제외, 안전한 아이콘만 사용

**생성 파일:**
- `lib/utils.ts`
- `components/hero/MinimalistHero.tsx`
- `app/page.tsx` (랜딩페이지)

---

### Q7. 런타임 에러 — Client Component에 함수 전달 불가

**에러 메시지:**
```
Only plain objects can be passed to Client Components from Server Components.
Classes or other objects with methods are not supported.
{icon: {$$typeof: ..., render: ...}, href: ...}
```

**원인:** `app/page.tsx`가 Server Component인데 lucide-react 아이콘(함수)을 Client Component인 `MinimalistHero`에 props로 전달하려 했음.

**해결:** `app/page.tsx` 상단에 `'use client'` 추가

```tsx
// app/page.tsx
'use client'; // ← 이 줄 추가

import { MinimalistHero } from '@/components/hero/MinimalistHero';
```

**원리:**
- Server → Client: plain object, string, number 등 직렬화 가능한 값만 전달 가능
- 함수/클래스: 직렬화 불가 → 같은 클라이언트 영역이어야 전달 가능

---

### Q8. Hero 섹션 텍스트 수정 / SNS·위치 제거

**서비스 정의:** YouTube 영상 제작에 사용 가능한 음악을 생성하는 AI 서비스 — **mu8ic**

**변경 내용:**

| 항목 | 이전 | 이후 |
|---|---|---|
| `mainText` | "Discover a new era of sound..." | "Generate royalty-free music for your YouTube videos in seconds. Powered by AI — no instruments, no studios, no limits." |
| 네비게이션 | MUSIC / ABOUT / STORE / CONTACT | HOW IT WORKS / PRICING / EXAMPLES / CONTACT |
| `socialLinks` | Music, Headphones, Radio, Globe 아이콘 | **제거** |
| `locationText` | "SEOUL, KR" | **제거** |

**컴포넌트 수정:** `MinimalistHero`에서 `socialLinks`, `locationText`를 optional 처리 — 두 값이 없으면 footer 미렌더링.

---

## 2026-04-26

### Q9. GitHub Push Protection 에러 (비밀 키 노출)

**문제:** `scratch/` 폴더 내 스크립트에 Supabase Secret Key를 하드코딩하여 푸시가 차단됨.

**해결:**
1.  **코드 수정**: `.env.local`에서 환경 변수를 읽어오도록 로직 변경 (Node.js 환경 대응).
2.  **Git 히스토리 수정**: `git commit --amend`를 통해 마지막 커밋에서 비밀 키 기록 삭제.
3.  **보안 조치**: Supabase 대시보드에서 Service Role Key 재발급(Rotate).

---

### Q10. Workspace 페이지 구축

**요청:** 로그인한 사용자를 위한 전용 공간 생성 및 `#171717` 배경 디자인 적용.

**작업 내용:**
- `app/workspace/page.tsx` 생성.
- 프리미엄 대시보드 레이아웃 (Glassmorphism, 통계 카드, 트랙 목록) 구현.
- 비로그인 사용자를 `/auth`로 자동 리다이렉트 처리.

---

### Q11. 구글 로그인 후 리다이렉트 오류 (Auth Callback Error)

**문제:** 로그인 성공 후 `#access_token` 해시 프래그먼트가 포함된 URL로 리다이렉트되어 서버에서 인증 코드를 읽지 못함 (`no_code_found`).

**원인:** 클라이언트 사이드 `supabase` 객체가 SSR에 적합하지 않은 기본 방식(Implicit Flow)으로 동작함.

**해결:**
- `lib/supabase.ts`에서 `@supabase/ssr`의 `createBrowserClient`를 사용하도록 수정.
- PKCE Flow를 활성화하여 서버와 쿠키를 정상적으로 공유하게 함.

---

### Q12. 네비게이션 동적화

**작업 내용:**
- `AuthContext`를 연동하여 로그인 상태에 따라 버튼을 `LOGIN` 또는 `WORKSPACE`로 자동 변경.
- 로그인 성공 시 자동으로 `/workspace`로 이동하도록 콜백 및 권한 확인 로직 고도화.

### Q13. Workspace Navbar 구축 (Liquid Glass Design)

**요청:** 투명한 배경, 중앙 검색창, 우측 사용자 프로필 팝오버(로그아웃 포함)를 갖춘 Liquid Glass 디자인의 Navbar 구현.

**작업 내용:**
- `components/workspace/navbar.tsx` 생성.
- `framer-motion`을 이용한 호버 팝오버 및 액체 유리 질감 디자인 적용.
- `AuthContext` 연동을 통한 실시간 사용자 정보 및 로그아웃 기능 통합.
- `app/workspace/page.tsx` 레이아웃 리팩토링 (Navbar 상단 고정).

### Q14. 하단 프롬프트 입력창 구축 (Radix UI & Framer Motion)

**요청:** 이미지 업로드, 음성 녹음, 검색/생각/캔버스 모드 전환 기능을 갖춘 고급 프롬프트 창을 화면 하단에 고정.

**작업 내용:**
- `@radix-ui/react-tooltip`, `@radix-ui/react-dialog` 패키지 설치.
- `components/workspace/prompt-input-box.tsx` 생성.
- `framer-motion`을 이용한 시각적 효과(비주얼라이저, 모달 애니메이션 등) 적용.
- `app/workspace/page.tsx` 하단에 고정 배치 및 레이아웃 최적화.

---

## 2026-04-28

### Q15. Replicate AI 음악 생성 엔진 연동

**요청:** `visoar/ace-step-1.5` 모델을 사용하여 프롬프트 기반 음악 생성 기능을 구현하고 결과물을 Supabase에 저장.

**작업 내용:**
- `app/actions/generate-music.ts`: Replicate API 호출 → 오디오 다운로드 → Supabase Storage 업로드 → DB 메타데이터 저장 과정을 수행하는 Server Action 구현.
- `lib/supabase-server.ts`: RLS 우회를 위한 서비스 롤 기반 관리자 클라이언트 설정.
- `scripts/setup-supabase.mjs`: `musics` 테이블 및 스토리지 버킷 자동 생성을 위한 SQL 스크립트 작성.

### Q16. 워크스페이스 프리미엄 UI 개편

**요청:** 스크린샷 디자인을 바탕으로 워크스페이스의 룩앤필을 전문가급 다크 모드로 업그레이드.

**작업 내용:**
- `components/workspace/music-list.tsx`: 파형(Waveform) 비주얼라이저, 재생 컨트롤러, 다운로드 버튼이 포함된 프리미엄 카드 디자인 적용.
- `components/workspace/prompt-input.tsx`: 필(Pill) 형태의 둥근 입력창과 아이콘 툴바 배치.
- `components/workspace/workspace-navbar.tsx`: 미니멀한 검색창과 프로필 팝오버로 디자인 간소화 및 세련미 강화.

### Q18. Hugging Face Inference API 장애 및 404 에러

**현상:** 공식 MusicGen 모델 호출 시 `404 Not Found` 또는 `503 Service Unavailable` 지속 발생.
**원인:** 무료 공유 API의 오디오 생성 모델 지원 중단 혹은 트래픽 폭주로 인한 가용성 상실.
**조치:** 외부 API 의존성을 낮추기 위해 브라우저 로컬 추론(Transformers.js) 도입 결정.

### Q19. 브라우저 로컬 추론(Transformers.js) 도입 및 네트워크 에러

**현상:** Web Worker 내부에서 `importScripts`를 통해 CDN 라이브러리 로드 시 `NetworkError` 발생.
**원인:** 브라우저의 보안 정책(CSP) 혹은 네트워크 일시 장애로 인해 외부 스크립트 실행 차단.
**해결:** 
1.  `public/transformers.min.js`로 라이브러리를 직접 다운로드하여 로컬 자원화.
2.  워커 내부 경로를 `/transformers.min.js`로 수정하여 외부 의존성 제거.
3.  다운로드 퍼센트(%)를 실시간으로 보여주는 진행률 로직 구현.

### Q20. 프로젝트 개발 종료 (인프라 완비 및 환경 제약)

**상태:** 
- **UI/UX:** 전문가급 다크 모드 작업 공간 및 실시간 진행률 피드백 시스템 구축 완료.
- **Storage:** Supabase를 통한 생성 결과물 저장 및 히스토리 관리 로직 완비.
- **AI Engine:** 브라우저 로컬 추론 시스템(Web Worker) 구축 완료.
**결론:** 외부 API의 유료화 장벽과 로컬 브라우저의 리소스 한계(300MB+ 모델 로드)를 확인하였으며, 향후 고성능 GPU 인프라 확보 시 즉시 서비스가 가능한 수준의 아키텍처를 완성하고 개발 종료.

---

## 핵심 교훈

1. **lucide-react 최신 버전에서 SNS 브랜드 아이콘 없음** — `Music`, `Globe`, `Headphones` 등 범용 아이콘 사용
2. **Server Component → Client Component로 함수 전달 불가** — props로 React 컴포넌트/함수를 넘길 때는 두 파일 모두 `'use client'` 필요
3. **Supabase SSR 환경에서는 `createBrowserClient` 필수** — Next.js App Router에서 서버와 세션을 공유하려면 PKCE Flow를 지원하는 브라우저 전용 클라이언트 사용 필요
4. **Git 히스토리에 포함된 비밀 키는 `amend`로 제거 가능** — 하지만 푸시 전이라도 이미 노출된 키는 반드시 재발급(Rotate) 권장
5. **외부 API(Replicate/HF)의 불확실성 대비** — 유료 결제(`402`)나 서버 장애(`503`)에 대비하여 클라이언트 사이드 추론(Transformers.js)과 같은 Fallback 전략이 필수적임
6. **Web Worker 자원 관리** — 거대 AI 모델을 다룰 때는 `public` 폴더를 통한 로컬 자원 서빙과 상세한 진행률(Progress) 표시가 사용자 경험(UX)을 결정함
