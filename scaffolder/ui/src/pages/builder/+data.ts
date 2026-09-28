export type Data = {
    modules: string[];
    apiAvailable: boolean;
};

export default async function data(): Promise<Data> {
    const apiBaseUrl = process.env.SCAFFOLDER_API_URL ?? "http://127.0.0.1:7070";
    try {
        const response = await fetch(`${apiBaseUrl}/api/modules`);
        if (!response.ok) {
            return {modules: [], apiAvailable: false};
        }
        const payload = (await response.json()) as { availableModules?: string[] };
        const modules = [...(payload.availableModules ?? [])].sort((a, b) => a.localeCompare(b));
        return {modules, apiAvailable: true};
    } catch {
        return {modules: [], apiAvailable: false};
    }
}
