#!/usr/bin/env bash
# Generates every Android launcher icon (+ the 512px Play Store icon) from one square image.
# Usage: tools/make-android-icon.sh path/to/logo.png      (needs ImageMagick: convert)
set -euo pipefail

SRC="${1:-branding/app-logo.png}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RES="$ROOT/app/src/main/res"
[ -f "$SRC" ] || { echo "Logo not found: $SRC"; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Square, centre-cropped master
convert "$SRC" -auto-orient -depth 8 -strip -gravity center -resize 1024x1024^ -extent 1024x1024 "$TMP/master.png"
# Background colour for the adaptive icon = colour of the top-left corner of the artwork
BG="$(convert "$TMP/master.png" -crop 16x16+4+4 -resize 1x1\! -depth 8 -format "#%[hex:p{0,0}]" info:)"
BG="${BG:0:7}"

declare -A LEGACY=( [mdpi]=48 [hdpi]=72 [xhdpi]=96 [xxhdpi]=144 [xxxhdpi]=192 )
declare -A ADAPTIVE=( [mdpi]=108 [hdpi]=162 [xhdpi]=216 [xxhdpi]=324 [xxxhdpi]=432 )

for d in "${!LEGACY[@]}"; do
  s=${LEGACY[$d]}; a=${ADAPTIVE[$d]}
  dir="$RES/mipmap-$d"; mkdir -p "$dir"
  r=$((s / 6))
  # Legacy square icon with rounded corners
  convert "$TMP/master.png" -resize ${s}x${s} \
    \( -size ${s}x${s} xc:none -fill white -draw "roundrectangle 0,0,$((s-1)),$((s-1)),$r,$r" \) \
    -alpha set -compose DstIn -composite "$dir/ic_launcher.png"
  # Legacy round icon
  convert "$TMP/master.png" -resize ${s}x${s} \
    \( -size ${s}x${s} xc:none -fill white -draw "circle $((s/2)),$((s/2)) $((s/2)),0" \) \
    -alpha set -compose DstIn -composite "$dir/ic_launcher_round.png"
  # Adaptive foreground: artwork inside the 72/108 safe zone (launchers mask the outer area)
  inner=$((a * 80 / 108))
  convert -size ${a}x${a} "xc:$BG" \( "$TMP/master.png" -resize ${inner}x${inner} \) \
    -gravity center -composite "$dir/ic_launcher_foreground.png"
done

mkdir -p "$RES/values" "$RES/mipmap-anydpi-v26"
cat > "$RES/values/ic_launcher_background.xml" <<XML
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">$BG</color>
</resources>
XML
for name in ic_launcher ic_launcher_round; do
cat > "$RES/mipmap-anydpi-v26/$name.xml" <<XML
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
XML
done
# Old vector drawables are no longer used
rm -f "$RES/drawable/ic_launcher_background.xml" "$RES/drawable/ic_launcher_foreground.xml"

# Play Store listing icon (512x512, no transparency)
mkdir -p "$ROOT/branding"
convert "$TMP/master.png" -resize 512x512 -background "$BG" -alpha remove "$ROOT/branding/playstore-icon-512.png"
echo "Icons generated (background $BG). Play Store icon: branding/playstore-icon-512.png"
