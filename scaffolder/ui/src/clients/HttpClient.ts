import type {ProjectSpec} from "@app/types/ProjectSpec";

type DownloadScaffoldParams = {
    projectSpec: ProjectSpec;
    counterName?: string;
};

type WishlistSubscriptionParams = {
    email: string;
    systemName: string;
};

class HttpClient {
    private readonly baseUrl: string;

    constructor(baseUrl = "/api") {
        this.baseUrl = baseUrl;
    }

    async downloadScaffold(params: DownloadScaffoldParams): Promise<{ blob: Blob; fileName: string }> {
        const abortController = new AbortController();
        const timeout = window.setTimeout(() => abortController.abort(), 180000);
        const requestBody = {
            projectSpec: params.projectSpec,
            ...(params.counterName ? {counterName: params.counterName.trim()} : {})
        };

        const response = await fetch(`${this.baseUrl}/scaffold`, {
            method: "POST",
            headers: {
                Accept: "application/zip",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody),
            signal: abortController.signal
        }).finally(() => {
            window.clearTimeout(timeout);
        });

        if (!response.ok) {
            throw new Error(await this.getErrorMessage(response));
        }

        const blob = await response.blob();
        const fileName = this.getFileName(response) ?? "scaffold.zip";
        return {blob, fileName};
    }

    async subscribeWishlist(params: WishlistSubscriptionParams): Promise<void> {
        const response = await fetch(`${this.baseUrl}/wishlist`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: params.email.trim(),
                systemName: params.systemName.trim()
            })
        });

        if (!response.ok) {
            throw new Error(`Wishlist subscription failed: ${response.status}`);
        }
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

    private async getErrorMessage(response: Response): Promise<string> {
        try {
            const responseBody: unknown = await response.json();
            if (typeof responseBody === "object" && responseBody !== null && "errors" in responseBody) {
                const errors = (responseBody as {errors?: unknown}).errors;
                if (Array.isArray(errors)) {
                    const fieldErrors = errors
                        .filter((error): error is {field: string; message: string} => {
                            return typeof error === "object" && error !== null &&
                                typeof (error as {field?: unknown}).field === "string" &&
                                typeof (error as {message?: unknown}).message === "string";
                        })
                        .map((error) => `${error.field}: ${error.message}`);
                    if (fieldErrors.length > 0) {
                        return fieldErrors.join(" ");
                    }
                }
            }
        } catch {
            return `Scaffold download failed: ${response.status}`;
        }
        return `Scaffold download failed: ${response.status}`;
    }
}

export default new HttpClient();
