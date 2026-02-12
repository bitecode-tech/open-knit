const installFlag = "__scaffolderTimestampConsoleInstalled";

type ConsoleMethodName = "log" | "info" | "warn" | "error" | "debug";

function withTimestampPrefix(args: unknown[]): unknown[] {
    const timestamp = new Date().toISOString();
    if (args.length === 0) {
        return [`[${timestamp}]`];
    }

    const [firstArg, ...restArgs] = args;
    if (typeof firstArg === "string") {
        return [`[${timestamp}] ${firstArg}`, ...restArgs];
    }

    return [`[${timestamp}]`, firstArg, ...restArgs];
}

export function installTimestampedConsole(): void {
    const globalWithFlag = globalThis as typeof globalThis & Record<string, unknown>;
    if (globalWithFlag[installFlag]) {
        return;
    }

    const methodNames: ConsoleMethodName[] = ["log", "info", "warn", "error", "debug"];
    for (const methodName of methodNames) {
        const originalMethod = console[methodName].bind(console);
        console[methodName] = (...args: unknown[]) => {
            originalMethod(...withTimestampPrefix(args));
        };
    }

    globalWithFlag[installFlag] = true;
}
