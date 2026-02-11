type DownloadScaffoldParams = {
    name: string;
    modules: string[];
    demoInsertsEnabled: boolean;
    aiEnabled: boolean;
};

class HttpClient {
    private readonly baseUrl: string;

    constructor(baseUrl = "/api") {
        this.baseUrl = baseUrl;
    }

    async downloadScaffold(params: DownloadScaffoldParams): Promise<{ blob: Blob; fileName: string }> {
        const abortController = new AbortController();
        const timeout = window.setTimeout(() => abortController.abort(), 180000);
        const query = new URLSearchParams();
        if (params.name.trim()) {
            query.set("name", params.name.trim());
        }
        if (params.modules.length > 0) {
            query.set("modules", params.modules.join(","));
        }
        query.set("demoInsertsEnabled", String(params.demoInsertsEnabled));
        query.set("aiEnabled", String(params.aiEnabled));

        const response = await fetch(`${this.baseUrl}/scaffold?${query.toString()}`, {
            method: "GET",
            headers: {
                Accept: "application/zip"
            },
            signal: abortController.signal
        }).finally(() => {
            window.clearTimeout(timeout);
        });

        if (!response.ok) {
            throw new Error(`Scaffold download failed: ${response.status}`);
        }

        const blob = await response.blob();
        const fileName = this.getFileName(response) ?? "scaffold.zip";
        return {blob, fileName};
    }

    private getFileName(response: Response): string | null {
        const header = response.headers.get("content-disposition");
        if (!header) {
            return null;
        }
        const match = /filename\\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i.exec(header);
        if (!match) {
            return null;
        }
        const fileName = decodeURIComponent(match[1] ?? match[2] ?? "");
        return fileName || null;
    }
}

export default new HttpClient();
