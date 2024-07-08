export function truncateString(str: string | undefined, maxLength: number): string {
    if (str == undefined) return "";
    if (str.length <= maxLength) {
        return str;
    }
    return '...' + str.slice(-maxLength);
}