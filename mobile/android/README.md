# Android App Icons

알프레도 앱 아이콘 (Android용)

## 디렉토리 구조

```
res/
├── mipmap-mdpi/      # 48x48
│   ├── ic_launcher.png
│   └── ic_launcher_round.png
├── mipmap-hdpi/      # 72x72
│   ├── ic_launcher.png
│   └── ic_launcher_round.png
├── mipmap-xhdpi/     # 96x96
│   ├── ic_launcher.png
│   └── ic_launcher_round.png
├── mipmap-xxhdpi/    # 144x144
│   ├── ic_launcher.png
│   └── ic_launcher_round.png
└── mipmap-xxxhdpi/   # 192x192
    ├── ic_launcher.png
    └── ic_launcher_round.png
```

## 필요한 파일

`alfredo-app-icon-1024.png` (어두운 배경 버전)에서 아래 사이즈로 리사이즈하세요.

| 폴더 | 사이즈 | 밀도 |
|------|--------|------|
| mipmap-mdpi | 48x48 | ~160dpi |
| mipmap-hdpi | 72x72 | ~240dpi |
| mipmap-xhdpi | 96x96 | ~320dpi |
| mipmap-xxhdpi | 144x144 | ~480dpi |
| mipmap-xxxhdpi | 192x192 | ~640dpi |

## 리사이즈 명령어 (ImageMagick)

```bash
MASTER="alfredo-app-icon-1024.png"

# mdpi (48x48)
convert $MASTER -resize 48x48 res/mipmap-mdpi/ic_launcher.png
cp res/mipmap-mdpi/ic_launcher.png res/mipmap-mdpi/ic_launcher_round.png

# hdpi (72x72)
convert $MASTER -resize 72x72 res/mipmap-hdpi/ic_launcher.png
cp res/mipmap-hdpi/ic_launcher.png res/mipmap-hdpi/ic_launcher_round.png

# xhdpi (96x96)
convert $MASTER -resize 96x96 res/mipmap-xhdpi/ic_launcher.png
cp res/mipmap-xhdpi/ic_launcher.png res/mipmap-xhdpi/ic_launcher_round.png

# xxhdpi (144x144)
convert $MASTER -resize 144x144 res/mipmap-xxhdpi/ic_launcher.png
cp res/mipmap-xxhdpi/ic_launcher.png res/mipmap-xxhdpi/ic_launcher_round.png

# xxxhdpi (192x192)
convert $MASTER -resize 192x192 res/mipmap-xxxhdpi/ic_launcher.png
cp res/mipmap-xxxhdpi/ic_launcher.png res/mipmap-xxxhdpi/ic_launcher_round.png
```

## Adaptive Icon (Android 8.0+)

추후 Adaptive Icon 지원이 필요하면:
- `ic_launcher_foreground.png` (전경 레이어)
- `ic_launcher_background.png` (배경 레이어)

현재는 레거시 아이콘만 지원합니다.
