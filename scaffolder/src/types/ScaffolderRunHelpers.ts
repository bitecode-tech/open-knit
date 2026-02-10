export type ScaffolderRunHelpers = {
    readRequiredFile: (filePath: string, displayName: string) => string;
    runStep: <T>(message: string, action: () => T | Promise<T>) => Promise<T>;
};
