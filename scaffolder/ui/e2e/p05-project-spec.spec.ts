import {expect, test} from "@playwright/test";

test.describe("P05 project specification", () => {
    test("keeps project metadata inside a narrow viewport and requires platform confirmation", async ({page}) => {
        await page.setViewportSize({width: 375, height: 844});
        await page.goto("/");

        await expect(page.getByLabel("Project name")).toHaveValue("my-application");

        for (const width of [375, 360, 320]) {
            await page.setViewportSize({width, height: 844});
            const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
            expect(documentWidth, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(width);
        }

        await page.getByRole("button", {name: /Modules Pick individual modules/}).click();
        const identityModule = page.getByRole("button", {name: /Identity module/});
        await expect(identityModule).toBeDisabled();
        await expect(identityModule).toContainText("(default)");

        const targetPlatform = page.getByLabel("Where will you run Docker Compose?");
        await targetPlatform.selectOption("windows");
        const platformConfirmation = page.getByRole("checkbox", {
            name: "I confirm this is the platform where I will run Docker Compose."
        });
        const generateButton = page.getByRole("button", {name: "Generate"});
        await expect(generateButton).toBeDisabled();
        await platformConfirmation.check();
        await expect(generateButton).toBeEnabled();
    });

    test("submits the selected project details and shows invalid-name feedback", async ({page}) => {
        await page.route("**/api/scaffold", async (route) => {
            await route.fulfill({
                status: 400,
                contentType: "application/json",
                body: JSON.stringify({
                    errors: [{field: "projectName", message: "must use lowercase letters and hyphens"}]
                })
            });
        });

        await page.goto("/");
        await page.getByRole("button", {name: /Modules Pick individual modules/}).click();
        await page.getByLabel("Project name").fill("Invalid Name!");
        await page.getByLabel("Where will you run Docker Compose?").selectOption("windows");
        await page.getByRole("checkbox", {
            name: "I confirm this is the platform where I will run Docker Compose."
        }).check();

        const requestPromise = page.waitForRequest((request) => {
            return request.url().endsWith("/api/scaffold") && request.method() === "POST";
        });
        await page.getByRole("button", {name: "Generate"}).click();
        const request = await requestPromise;
        const requestBody = request.postDataJSON() as {
            projectSpec: {
                projectName: string;
                modules: string[];
                targetPlatform: string;
                schemaVersion: number;
            };
        };

        expect(requestBody.projectSpec).toMatchObject({
            projectName: "Invalid Name!",
            modules: ["identity"],
            targetPlatform: "windows",
            schemaVersion: 1
        });
        await expect(page.getByRole("heading", {name: "We couldn't complete that request"})).toBeVisible();
        await expect(page.getByText("projectName: must use lowercase letters and hyphens")).toBeVisible();
    });

    test("downloads the selected bundle and confirms it is ready", async ({page}) => {
        let submittedProjectSpec: unknown;
        await page.route("**/api/scaffold", async (route) => {
            const requestBody = route.request().postDataJSON() as {projectSpec: unknown};
            submittedProjectSpec = requestBody.projectSpec;
            await route.fulfill({
                status: 200,
                headers: {
                    "content-type": "application/zip",
                    "content-disposition": "attachment; filename=sample-app.zip"
                },
                body: "test zip content"
            });
        });

        await page.goto("/");
        await page.getByRole("button", {name: /Bundles \(recommended\)/}).click();
        await page.getByRole("button", {name: /Subscription Access/}).click();
        await page.getByLabel("Project name").fill("sample-app");
        await page.getByLabel("Where will you run Docker Compose?").selectOption("macos");
        await page.getByRole("checkbox", {
            name: "I confirm this is the platform where I will run Docker Compose."
        }).check();

        const downloadPromise = page.waitForEvent("download");
        await page.getByRole("button", {name: "Generate"}).click();
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toBe("sample-app.zip");
        expect(submittedProjectSpec).toMatchObject({
            schemaVersion: 1,
            projectName: "sample-app",
            modules: ["identity", "wallet", "transaction", "payment"],
            targetPlatform: "macos",
            templateId: "subscription-access"
        });
        await expect(page.getByRole("heading", {name: "Your project ZIP is ready"})).toBeVisible();
    });
});
