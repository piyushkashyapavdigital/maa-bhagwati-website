#!/usr/bin/env bash
# One-command client-app release:
#   ./release.sh 3 1.1 "Naye banners aur tez app"
# Does: bump versions → release APK → GitHub Release → push.
set -euo pipefail
cd "$(dirname "$0")/client-mobile"

CODE="$1"          # e.g. 3  (must be > previous)
NAME="$2"          # e.g. 1.1
NOTES="${3:-Update available}"  # release notes (Hindi ok)

# 1. Bump native + JS versions together (they must always match)
sed -i "s/versionCode .*/versionCode $CODE/" android/app/build.gradle
sed -i "s/versionName .*/versionName \"$NAME\"/" android/app/build.gradle
sed -i "s/APP_VERSION_CODE = .*/APP_VERSION_CODE = $CODE;/" src/config.ts

# 2. Tests + build
npx tsc --noEmit -p tsconfig.json
npx jest
./gradlew assembleRelease 2>&1 | tail -2
cd ..

# 3. Point version.json at the new release asset
APK="client-mobile/android/app/build/outputs/apk/release/app-release.apk"
TAG="v$NAME"
cat > updates/client/version.json <<EOF
{
  "versionCode": $CODE,
  "versionName": "$NAME",
  "apkUrl": "https://github.com/piyushkashyapavdigital/maa-bhagwati-website/releases/download/$TAG/app-release.apk",
  "notes": "$NOTES"
}
EOF

# 4. Commit, tag, upload
git add client-mobile/android/app/build.gradle client-mobile/src/config.ts updates/client/version.json
git commit -m "release: client app v$NAME ($CODE)"
git tag "$TAG"
git push && git push --tags
gh release create "$TAG" "$APK" --title "Client app v$NAME" --notes "$NOTES"

echo "Released v$NAME. Phones will pop the update on next open."
