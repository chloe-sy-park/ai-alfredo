# iOS App Icon Set

알프레도 앱 아이콘 (iOS용)

## 필요한 파일

`alfredo-app-icon-1024.png` (어두운 배경 버전)에서 아래 사이즈로 리사이즈하세요.

| 파일명 | 사이즈 | 용도 |
|--------|--------|------|
| AppIcon-20.png | 20x20 | iPad Notification |
| AppIcon-20@2x.png | 40x40 | iPhone/iPad Notification |
| AppIcon-20@3x.png | 60x60 | iPhone Notification |
| AppIcon-29.png | 29x29 | iPad Settings |
| AppIcon-29@2x.png | 58x58 | iPhone/iPad Settings |
| AppIcon-29@3x.png | 87x87 | iPhone Settings |
| AppIcon-40.png | 40x40 | iPad Spotlight |
| AppIcon-40@2x.png | 80x80 | iPhone/iPad Spotlight |
| AppIcon-40@3x.png | 120x120 | iPhone Spotlight |
| AppIcon-60@2x.png | 120x120 | iPhone App |
| AppIcon-60@3x.png | 180x180 | iPhone App |
| AppIcon-76.png | 76x76 | iPad App |
| AppIcon-76@2x.png | 152x152 | iPad App |
| AppIcon-83.5@2x.png | 167x167 | iPad Pro App |
| AppIcon-1024.png | 1024x1024 | App Store |

## 리사이즈 명령어 (ImageMagick)

```bash
# 마스터 이미지에서 모든 사이즈 생성
MASTER="alfredo-app-icon-1024.png"

convert $MASTER -resize 20x20 AppIcon-20.png
convert $MASTER -resize 40x40 AppIcon-20@2x.png
convert $MASTER -resize 60x60 AppIcon-20@3x.png
convert $MASTER -resize 29x29 AppIcon-29.png
convert $MASTER -resize 58x58 AppIcon-29@2x.png
convert $MASTER -resize 87x87 AppIcon-29@3x.png
convert $MASTER -resize 40x40 AppIcon-40.png
convert $MASTER -resize 80x80 AppIcon-40@2x.png
convert $MASTER -resize 120x120 AppIcon-40@3x.png
convert $MASTER -resize 120x120 AppIcon-60@2x.png
convert $MASTER -resize 180x180 AppIcon-60@3x.png
convert $MASTER -resize 76x76 AppIcon-76.png
convert $MASTER -resize 152x152 AppIcon-76@2x.png
convert $MASTER -resize 167x167 AppIcon-83.5@2x.png
cp $MASTER AppIcon-1024.png
```

## Contents.json

이미 생성되어 있습니다. Xcode에서 자동으로 인식합니다.
