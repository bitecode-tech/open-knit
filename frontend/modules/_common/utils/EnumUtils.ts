export const enumToReadableText = (text?: string, fallbackText?: string) => {
    return text
        ? text
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : (fallbackText || "")
}