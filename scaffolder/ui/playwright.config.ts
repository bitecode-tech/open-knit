import {defineConfig} from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    retries: 0,
    workers: 1,
    reporter: [
        ["list"],
        ["html", {outputFolder: "temp/playwright-report", open: "never"}]
    ],
    outputDir: "temp/test-results",
    use: {
        baseURL: "http://127.0.0.1:3000",
        browserName: "chromium",
        screenshot: "only-on-failure",
        trace: "retain-on-failure",
        video: "retain-on-failure"
    },
    webServer: {
        command: "pnpm run dev",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
});
