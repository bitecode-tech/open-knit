export function formatFileSize(bytes?: number): string {
    if (bytes === undefined || bytes === null) {
        return "—";
    }
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "0 B";
    }
    const units = ["B", "KB", "MB", "GB", "TB"];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, exponent);
    const decimals = value >= 10 || exponent === 0 ? 0 : 1;
    return `${value.toFixed(decimals)} ${units[exponent]}`;
}

export function formatDuration(durationMs: number): string {
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
        return "0:00";
    }
    const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
