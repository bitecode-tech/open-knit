import {loadEnvFile} from "./env/loadEnvFile";

loadEnvFile();
const scaffolderService = require("@/services/ScaffolderService").default;

scaffolderService.run(process.argv.slice(2)).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
