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

## 핵심 교훈

1. **lucide-react 최신 버전에서 SNS 브랜드 아이콘 없음** — `Music`, `Globe`, `Headphones` 등 범용 아이콘 사용
2. **Server Component → Client Component로 함수 전달 불가** — props로 React 컴포넌트/함수를 넘길 때는 두 파일 모두 `'use client'` 필요
3. **PowerShell 실행 정책 문제** — `npm` 명령은 PowerShell 대신 `cmd /c` 를 사용하거나 터미널에서 직접 실행
