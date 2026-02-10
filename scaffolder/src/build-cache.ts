import path from "path";
import {register} from "tsconfig-paths";

register({
    baseUrl: path.resolve(__dirname),
    paths: {
        "@/*": ["*"]
    }
});

const scaffolderService = require("@/services/ScaffolderService").default;

scaffolderService.buildCache().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
