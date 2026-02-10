import scaffolderService from "@/services/ScaffolderService";

scaffolderService.run(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
