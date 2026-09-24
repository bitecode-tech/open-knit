#!/bin/sh

set -eu

WORKSPACE_DIR="/workspace"
GRADLE_USER_HOME="${GRADLE_USER_HOME:-/tmp/gradle-home}"
GRADLE_PROJECT_CACHE_DIR="${GRADLE_PROJECT_CACHE_DIR:-/tmp/gradle-project-cache}"
GRADLE_BUILD_ROOT_DIR="${GRADLE_BUILD_ROOT_DIR:-/tmp/open-knit-gradle-build}"
GRADLE_INIT_SCRIPT="${GRADLE_INIT_SCRIPT:-/workspace/scripts/gradle-container-builddir.init.gradle}"
HOST_UID="${HOST_UID:-1000}"
HOST_GID="${HOST_GID:-1000}"
APP_USER="${APP_USER:-openknit}"
APP_GROUP="${APP_GROUP:-openknit}"
APP_PID=""
LAST_FINGERPRINT=""

echo "[backend] http://localhost:8080"

compute_fingerprint() {
    find "$WORKSPACE_DIR" \
      \( -path "$WORKSPACE_DIR/.git" -o -path "$WORKSPACE_DIR/.idea" -o -path "$WORKSPACE_DIR/.gradle" -o -path "$WORKSPACE_DIR/storage" -o -path "$WORKSPACE_DIR/logs" -o -path '*/build' -o -path '*/.gradle' -o -path '*/out' \) \
      -prune \
      -o -type f \
      \( -name '*.java' -o -name '*.gradle' -o -name '*.gradle.kts' -o -name '*.properties' -o -name '*.yaml' -o -name '*.yml' -o -name '*.sql' -o -name '*.json' -o -name '*.sh' \) \
      -print0 | LC_ALL=C sort -z | xargs -0 sha1sum | sha1sum | awk '{print $1}'
}

stop_app() {
    if [ -n "$APP_PID" ] && kill -0 "$APP_PID" 2>/dev/null; then
        echo "[backend] stopping application"
        kill "$APP_PID" 2>/dev/null || true
        wait "$APP_PID" 2>/dev/null || true
    fi

    APP_PID=""
}

prepare_runtime_user() {
    if [ "$(id -u)" -ne 0 ]; then
        return
    fi

    if ! grep -q "^${APP_GROUP}:" /etc/group; then
        addgroup -g "$HOST_GID" "$APP_GROUP" >/dev/null 2>&1 || addgroup "$APP_GROUP" >/dev/null 2>&1
    fi

    if ! grep -q "^${APP_USER}:" /etc/passwd; then
        adduser -D -H -u "$HOST_UID" -G "$APP_GROUP" "$APP_USER" >/dev/null 2>&1 || adduser -D -H -G "$APP_GROUP" "$APP_USER" >/dev/null 2>&1
    fi

    mkdir -p "$GRADLE_USER_HOME" "$GRADLE_PROJECT_CACHE_DIR" "$GRADLE_BUILD_ROOT_DIR" /workspace/storage/documents
    chown -R "$APP_USER:$APP_GROUP" \
      "$GRADLE_USER_HOME" \
      "$GRADLE_PROJECT_CACHE_DIR" \
      "$GRADLE_BUILD_ROOT_DIR" \
      /workspace/storage/documents
}

start_app() {
    echo "[backend] starting application"
    chmod +x ./gradlew
    export GRADLE_USER_HOME
    if [ "$(id -u)" -eq 0 ]; then
        if ! command -v su-exec >/dev/null 2>&1; then
            echo "[backend] su-exec is missing from the image; rebuild the backend dev image" >&2
            exit 1
        fi

        exec su-exec "$APP_USER:$APP_GROUP" "$0" --run-app
    fi
    ./gradlew \
      -Dorg.gradle.projectcachedir="$GRADLE_PROJECT_CACHE_DIR" \
      -I "$GRADLE_INIT_SCRIPT" \
      bootRun \
      --no-daemon \
      --console=plain &
    APP_PID=$!
}

handle_exit() {
    stop_app
}

trap handle_exit INT TERM EXIT

if [ "${1:-}" = "--run-app" ]; then
    shift
fi

prepare_runtime_user
LAST_FINGERPRINT="$(compute_fingerprint)"
start_app

while true; do
    sleep 1

    NEXT_FINGERPRINT="$(compute_fingerprint)"
    if [ "$NEXT_FINGERPRINT" != "$LAST_FINGERPRINT" ]; then
        LAST_FINGERPRINT="$NEXT_FINGERPRINT"
        echo "[backend] change detected, restarting"
        stop_app
        start_app
        continue
    fi

    if [ -n "$APP_PID" ] && ! kill -0 "$APP_PID" 2>/dev/null; then
        APP_PID=""
        echo "[backend] application stopped, waiting for next file change"
    fi
done
