# Alfredo Character Assets Guide

알프레도 캐릭터 에셋 사용 가이드입니다.

## 디렉토리 구조

```
public/
└── assets/
    └── alfredo/
        ├── avatar/              # UI 아바타 (투명 배경)
        │   ├── alfredo-avatar-24.png
        │   ├── alfredo-avatar-32.png
        │   ├── alfredo-avatar-48.png
        │   ├── alfredo-avatar-64.png
        │   ├── alfredo-avatar-80.png
        │   ├── alfredo-avatar-120.png
        │   ├── alfredo-avatar-256.png
        │   ├── alfredo-avatar-512.png
        │   └── alfredo-avatar-1024.png  # 마스터 원본
        └── app-icon/            # 앱 아이콘 (어두운 배경)
            ├── alfredo-app-icon-512.png
            └── alfredo-app-icon-1024.png
```

## Avatar 사용 가이드

### 파일 종류

| 타입 | 배경 | 용도 |
|------|------|------|
| `avatar/` | 투명 | UI 컴포넌트, 대화창, 프로필 |
| `app-icon/` | 어두운 (#0B0C0F) | PWA 아이콘, 앱스토어 |

### 권장 사이즈 매핑

| UI 용도 | 컴포넌트 사이즈 | 권장 파일 |
|---------|----------------|-----------|
| 인라인 텍스트 옆 | 16-24px | `alfredo-avatar-24.png` |
| 헤더/네비게이션 | 32-40px | `alfredo-avatar-48.png` |
| 카드 내 아바타 | 48-64px | `alfredo-avatar-64.png` |
| Empty State | 80-120px | `alfredo-avatar-120.png` |
| 히어로/랜딩 | 200px+ | `alfredo-avatar-256.png` 또는 `512.png` |

### 코드 사용법

```tsx
// 방법 1: 직접 import
import { ALFREDO_AVATAR } from '@/components/alfredo/AlfredoAssets';

<img src={ALFREDO_AVATAR.md} alt="알프레도" />

// 방법 2: 사이즈 헬퍼 사용
import { getAvatarForSize, getAvatarSrcSet } from '@/components/alfredo/AlfredoAssets';

<img
  src={getAvatarForSize('md')}
  srcSet={getAvatarSrcSet('md')}
  alt="알프레도"
/>

// 방법 3: PenguinAvatar 컴포넌트 사용 (권장)
import { PenguinAvatar, MiniPenguin, InlineAlfredo } from '@/components/penguin/PenguinAvatar';

<PenguinAvatar size="md" showLevel animate />
<MiniPenguin onClick={handleClick} />
<InlineAlfredo />
```

## 디자인 가이드라인

### 허용되는 사용

- 대화 인터페이스에서 알프레도 메시지 옆 아바타
- 빈 상태(Empty State) 일러스트
- 로딩 애니메이션
- 온보딩/튜토리얼 가이드
- 설정 페이지 프로필

### 금지되는 사용

- CTA 버튼 내부 사용
- 리스트 아이템 반복 아이콘으로 사용
- OS 서브컬러(work/life/finance) 배경 위 직접 배치
- 캐릭터 변형/왜곡

### 배경 권장사항

| 배경 타입 | 권장 | 비권장 |
|-----------|------|--------|
| Neutral (white/gray) | ✅ | - |
| Lavender (#F5F3FF) | ✅ | - |
| OS Work (#4A5C73) | - | ❌ |
| OS Life (#7E9B8A) | - | ❌ |
| Gold/Accent | - | ❌ |

## 모바일 앱 아이콘 (참고)

### iOS (AppIcon.appiconset)

```
mobile/ios/AppIcon.appiconset/
├── AppIcon-20@2x.png    (40x40)
├── AppIcon-20@3x.png    (60x60)
├── AppIcon-29@2x.png    (58x58)
├── AppIcon-29@3x.png    (87x87)
├── AppIcon-40@2x.png    (80x80)
├── AppIcon-40@3x.png    (120x120)
├── AppIcon-60@2x.png    (120x120)
├── AppIcon-60@3x.png    (180x180)
├── AppIcon-76@2x.png    (152x152)
├── AppIcon-83.5@2x.png  (167x167)
├── AppIcon-1024.png     (1024x1024)
└── Contents.json
```

### Android (mipmap-*)

```
mobile/android/res/
├── mipmap-mdpi/ic_launcher.png     (48x48)
├── mipmap-hdpi/ic_launcher.png     (72x72)
├── mipmap-xhdpi/ic_launcher.png    (96x96)
├── mipmap-xxhdpi/ic_launcher.png   (144x144)
└── mipmap-xxxhdpi/ic_launcher.png  (192x192)
```

## 파일 명명 규칙

```
alfredo-{type}-{size}.png

type: avatar | app-icon
size: 픽셀 단위 (24, 32, 48, 64, 80, 120, 256, 512, 1024)
```

## 원본 파일

- **마스터 Avatar**: `alfredo-avatar-1024.png` (투명 배경)
- **마스터 App Icon**: `alfredo-app-icon-1024.png` (어두운 배경, 둥근 모서리)

리사이즈 시 마스터 파일에서 생성하세요.
