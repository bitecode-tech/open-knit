export function capitalizeFirstLetter(str: string, fallback?: string): string {
    if (!str) {
        return fallback ?? "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getFullName(name?: string, surname?: string): string | undefined {
    if (!name && !surname) {
        return undefined;
    }

    const parts = [name, surname].filter((s): s is string => !!s);

    return parts.join(' ');
}